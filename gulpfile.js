require('shelljs/global');

const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const gh = require('ghreleases');
const semver = require('semver');
const bump = require('gulp-bump');
const gutil = require('gulp-util');
const Dropbox = require('dropbox');
const mocha = require('gulp-mocha');
const chokidar = require('chokidar');
const pkg = require('./package.json');
const eslint = require('gulp-eslint');
const markdownEscape = require('markdown-escape');
const commitsBetween = require('commits-between');
const electronConnect = require('electron-connect');
const electronBuilder = require('electron-builder');

const DROPBOX_TOKEN = process.env.DROPBOX_TOKEN;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USER = process.env.GITHUB_USER;

const isTravisCi = process.env.TRAVIS === 'true';
const tagName = process.env.TRAVIS_TAG || null;
const isOsx = process.env.TRAVIS_OS_NAME === 'osx';
const versionFromTagName = semver.valid(tagName);
const buildVersion = versionFromTagName || semver.valid(pkg.version);
const prereleaseChannel = (semver.prerelease(buildVersion) || [])[0];
const isBeta = prereleaseChannel === 'beta';
const shouldRelease = isTravisCi && !!versionFromTagName && (!prereleaseChannel || prereleaseChannel === 'beta');

const artifactNames = {
  linux: `${pkg.name}-${buildVersion}-linux-x86_64.AppImage`,
  win: `${pkg.name}-${buildVersion}-windows.exe`,
  osx: `${pkg.name}-${buildVersion}-osx.dmg`
};

const buildConfig = {
  appId: isBeta ? 'de.anavis.beta' : 'de.anavis',
  productName: isBeta ? 'AnaVis Beta' : 'AnaVis',
  mac: {
    target: [{ target: 'dmg', arch: ['x64'] }],
    category: 'public.app-category.education'
  },
  linux: {
    target: [{ target: 'AppImage', arch: ['x64'] }],
    category: 'Education'
  },
  win: {
    target: [{ target: 'nsis', arch: ['x64'] }]
  },
  dmg: {
    artifactName: artifactNames.osx,
    iconSize: 120,
    iconTextSize: 14,
    contents: [{
      x: 478,
      y: 170,
      type: 'link',
      path: '/Applications'
    }, {
      x: 130,
      y: 170,
      type: 'file'
    }]
  },
  nsis: {
    artifactName: artifactNames.win,
    oneClick: false,
    allowToChangeInstallationDirectory: true
  },
  appImage: {
    artifactName: artifactNames.linux
  },
  publish: null
}

gulp.task('version', () => {
  return gulp.src('package.json')
    .pipe(bump({ version: buildVersion }))
    .pipe(gulp.dest('.'));
});

gulp.task('build', ['version'], async () => {
  await electronBuilder.build({
    config: buildConfig,
    mac: isOsx ? ['dmg'] : null,
    win: isOsx ? null : ['nsis'],
    linux: isOsx ? null : ['AppImage']
  });
  if (shouldRelease) {
    const filesToUpload = isOsx ? [artifactNames.osx] : [artifactNames.win, artifactNames.linux];
    await uploadArtifactsToDropbox(filesToUpload, './dist');
  }
});

gulp.task('release', async () => {
  if (!shouldRelease) {
    console.log('No release, nothing to do here.');
    return;
  }

  const filesToDownload = [artifactNames.osx, artifactNames.win, artifactNames.linux];
  const fileToUpload = filesToDownload.map(file => path.resolve(`./release/${file}`));
  const releaseName = `${buildConfig.productName} v${buildVersion}`;
  const githubAuth = { token: GITHUB_TOKEN, user: GITHUB_USER };

  await downloadArtifactsFromDropbox(filesToDownload, './release');
  const latestRelease = await getLatestGithubRelease(githubAuth, 'learningmedia', 'anavis');
  const commits = await commitsBetween({ from: latestRelease.tag_name });
  const releaseNotes = await createReleaseNotes(commits);
  const release = await createGithubRelease(githubAuth,'learningmedia', 'anavis', { tag_name: tagName, name: releaseName, body: releaseNotes, prerelease: isBeta });
  await uploadAssetsToGithubRelease(githubAuth, 'learningmedia', 'anavis', release.id, fileToUpload);
});

gulp.task('lint', () => {
  return gulp.src(['**/*.js', '!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
});

gulp.task('test', () => {
  return gulp.src(['**/*.spec.js', '!node_modules/**'], { read: false })
    .pipe(mocha({ require: './test-helper' }));
});

gulp.task('watch', done => {
  const chokidarOpts = {
    atomic: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 250,
      pollInterval: 50
    }
  };

  const watchers = [];

  const server = electronConnect.server.create({
    logLevel: 0, // warn only
    stopOnClose: true,
    spawnOpt: {
      stdio: 'inherit',
      env: Object.assign({ LIVE_RELOAD: 'true' }, process.env)
    }
  });

  const callback = procState => {
    gutil.log(gutil.colors.yellow('[livereload]'), procState);
    if (procState === 'stopped') {
      watchers.forEach(w => w.close());
      setTimeout(() => process.exit(0), 500); // Chokidar doesn't release all watchers, so force it!
      done();
    }
  };

  // Start browser process
  server.start(callback);

  watchers.push(chokidar.watch('app/{server,shared}/**/*.{js,json}', chokidarOpts).on('all', () => {
    // Restart browser process
    server.restart(callback);
  }));

  watchers.push(chokidar.watch('app/client/**/*.{html,js,json}', chokidarOpts).on('all', () => {
    // Reload renderer process(es)
    server.reload();
    callback('reload');
  }));

  watchers.push(chokidar.watch('app/client/**/*.{css,less}', chokidarOpts).on('all', () => {
    // Send signal to reload the stylesheets
    server.broadcast('reload-styles');
    callback('styles');
  }));
});

gulp.task('default', ['watch']);

/// HELPERS //////////////////////////////////////////////////////////////////////////////

function uploadArtifactsToDropbox(fileNames, sourceDir) {
  const absoluteDir = path.resolve(sourceDir);
  return Promise.all(fileNames.map(file => uploadToDropbox(path.join(absoluteDir, file), `/${file}`)));
}

function downloadArtifactsFromDropbox(fileNames, targetDir) {
  const absoluteDir = path.resolve(targetDir);
  mkdir('-p', absoluteDir);
  return Promise.all(fileNames.map(file => downloadFromDropbox(`/${file}`, path.join(absoluteDir, file))));
}

function uploadToDropbox(source, target) {
  const fileContent = fs.readFileSync(source);
  const dbx = new Dropbox({ accessToken: DROPBOX_TOKEN });
  return dbx.filesUpload({ path: target, contents: fileContent });
}

function downloadFromDropbox(source, target) {
  console.log(`Downloading from Dropbox: ${source}`);
  const dbx = new Dropbox({ accessToken: DROPBOX_TOKEN });
  return dbx.filesDownload({ path: source })
    .then(data => fs.writeFileSync(target, data.fileBinary, 'binary'));
}

function getLatestGithubRelease(githubAuth, owner, repo) {
  console.log('Fetching latest Github release');
  return new Promise((resolve, reject) => {
    gh.list(githubAuth, owner, repo, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res.sort((a, b) => semver.gt(a.tag_name, b.tag_name) ? -1 : 1)[0]);
      }
    });
  });
}

function createGithubRelease(githubAuth, owner, repo, data) {
  console.log(`Creating latest Github release: ${data.name}`);
  return new Promise((resolve, reject) => {
    gh.create(githubAuth, owner, repo, data, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

function uploadAssetsToGithubRelease(githubAuth, owner, repo, releaseId, files) {
  console.log('Uploading assets for Github release');
  return new Promise((resolve, reject) => {
    gh.uploadAssets(githubAuth, owner, repo, releaseId, files, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

function createReleaseNotes(commits) {
  return commits.map(c => `* ${markdownEscape(c.subject)}`).join('\n');
}
