const os = require('os');
const del = require('del');
const path = require('path');
const Jimp = require('jimp');
const gh = require('ghreleases');
const semver = require('semver');
const mkdirp = require('mkdirp');
const fs = require('fs/promises');
const Dropbox = require('dropbox');
const mocha = require('gulp-mocha');
const shell = require('gulp-shell');
const chokidar = require('chokidar');
const pkg = require('./package.json');
const eslint = require('gulp-eslint');
const fancyLog = require('fancy-log');
const markdownEscape = require('markdown-escape');
const commitsBetween = require('commits-between');
const { src, parallel, series } = require('gulp');
const electronConnect = require('electron-connect');
const electronBuilder = require('electron-builder');

const DROPBOX_TOKEN = process.env.DROPBOX_TOKEN;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USER = process.env.GITHUB_USER;

const isTravisCi = process.env.TRAVIS === 'true';
const tagName = process.env.TRAVIS_TAG || null;
const isOsx = os.platform() === 'darwin';
const isWin = os.platform() === 'win32';
const isLinux = os.platform() === 'linux';
const versionFromTagName = semver.valid(tagName);
const buildVersion = versionFromTagName || semver.valid(pkg.version);
const prereleaseChannel = (semver.prerelease(buildVersion) || [])[0];
const isBeta = prereleaseChannel === 'beta';
const shouldRelease = isTravisCi && !!versionFromTagName && (!prereleaseChannel || isBeta);

const BUILD_DIR = './build';
const DIST_DIR = './dist';
const RELEASE_DIR = './release';

const GITHUB_ORGA_NAME = 'learningmedia';
const GITHUB_REPO_NAME = 'anavis';

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
    category: 'public.app-category.education',
    icon: `${BUILD_DIR}/icons/mac/icon.icns`
  },
  linux: {
    target: [{ target: 'AppImage', arch: ['x64'] }],
    category: 'Education',
    icon: `${BUILD_DIR}/icons/png/`
  },
  win: {
    target: [{ target: 'nsis', arch: ['x64'] }],
    icon: `${BUILD_DIR}/icons/win/icon.ico`
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
};

const tasks = module.exports = {};

tasks.clean = () => del([BUILD_DIR, DIST_DIR]);

tasks.version = async () => {
  pkg.version = buildVersion;
  pkg.productName = buildConfig.productName;
  await fs.writeFile('./package.json', JSON.stringify(pkg, null, 2) + os.EOL, 'utf8');
};

tasks.icons = series(ensureBuildDir, shell.task(`electron-icon-maker --input=./assets/icon.png --output=${BUILD_DIR}`));

tasks.dmgBackground = series(ensureBuildDir, done => {
  return new Jimp(540, 380, 0xBBDEFBFF, (err, image) => err ? done(err) : image.write(`${BUILD_DIR}/background.png`, done));
});

tasks.assets = parallel(tasks.icons, tasks.dmgBackground);

tasks.prepareBuild = series(tasks.clean, tasks.version, tasks.assets);

tasks.build = series(tasks.prepareBuild, async () => {
  await electronBuilder.build({
    config: buildConfig,
    mac: isOsx ? ['dmg'] : null,
    win: isWin ? ['nsis'] : null,
    linux: isLinux ? ['AppImage'] : null
  });
  if (shouldRelease) {
    const filesToUpload = [isOsx && artifactNames.osx, isWin && artifactNames.win, isLinux && artifactNames.linux].filter(x => !!x);
    await uploadArtifactsToDropbox(filesToUpload, DIST_DIR);
  }
});

tasks.release = async () => {
  if (!shouldRelease) {
    fancyLog.info('No release, nothing to do here.');
    return;
  }

  const filesToDownload = [artifactNames.osx, artifactNames.win, artifactNames.linux];
  const fileToUpload = filesToDownload.map(file => path.resolve(`${RELEASE_DIR}/${file}`));
  const releaseName = `${buildConfig.productName} v${buildVersion}`;
  const githubAuth = { token: GITHUB_TOKEN, user: GITHUB_USER };

  await downloadArtifactsFromDropbox(filesToDownload, RELEASE_DIR);
  const latestRelease = await getLatestGithubRelease(githubAuth, GITHUB_ORGA_NAME, GITHUB_REPO_NAME);
  const commits = await commitsBetween({ from: latestRelease.tag_name });
  const releaseNotes = await createReleaseNotes(commits);
  const releaseOptions = { tag_name: tagName, name: releaseName, body: releaseNotes, prerelease: isBeta };
  const release = await createGithubRelease(githubAuth, GITHUB_ORGA_NAME, GITHUB_REPO_NAME, releaseOptions);
  await uploadAssetsToGithubRelease(githubAuth, GITHUB_ORGA_NAME, GITHUB_REPO_NAME, release.id, fileToUpload);
};

tasks.lint = () => {
  return src(['**/*.js', '!node_modules/**'])
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
};

tasks.serve = shell.task('electron app/server/main.js');

tasks.test = () => {
  return src(['**/*.spec.js', '!node_modules/**'], { read: false })
    .pipe(mocha({ require: './test-helper' }));
};

tasks.watch = done => {
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
    fancyLog.info('[livereload]', procState);
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
};

tasks.default = tasks.watch;

/// HELPERS //////////////////////////////////////////////////////////////////////////////

function ensureBuildDir() {
  return mkdirp(BUILD_DIR);
}

async function uploadArtifactsToDropbox(fileNames, sourceDir) {
  const absoluteDir = path.resolve(sourceDir);
  await Promise.all(fileNames.map(file => uploadToDropbox(path.join(absoluteDir, file), `/${file}`)));
}

async function downloadArtifactsFromDropbox(fileNames, targetDir) {
  const absoluteDir = path.resolve(targetDir);
  await mkdirp(absoluteDir);
  return Promise.all(fileNames.map(file => downloadFromDropbox(`/${file}`, path.join(absoluteDir, file))));
}

async function uploadToDropbox(source, target) {
  fancyLog.info(`Uploading to Dropbox: ${target}`);
  const fileContent = await fs.readFile(source);
  const dbx = new Dropbox({ accessToken: DROPBOX_TOKEN });
  await dbx.filesUpload({ path: target, contents: fileContent });
}

async function downloadFromDropbox(source, target) {
  fancyLog.info(`Downloading from Dropbox: ${source}`);
  const dbx = new Dropbox({ accessToken: DROPBOX_TOKEN });
  const data = await dbx.filesDownload({ path: source })
  await fs.writeFile(target, data.fileBinary, 'binary');
}

function getLatestGithubRelease(githubAuth, owner, repo) {
  fancyLog.info('Fetching latest Github release');
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
  fancyLog.info(`Creating latest Github release: ${data.name}`);
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
  fancyLog.info('Uploading assets for Github release');
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
  return commits.map(c => `* ${markdownEscape(c.subject)}`).join(os.EOL);
}
