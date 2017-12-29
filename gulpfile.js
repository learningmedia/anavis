require('shelljs/global');

const fs = require('fs');
const path = require('path');
const gulp = require('gulp');
const gh = require('ghreleases');
const semver = require('semver');
const bump = require('gulp-bump');
const Dropbox = require('dropbox');
const pkg = require('./package.json');
const markdownEscape = require('markdown-escape');
const commitsBetween = require('commits-between');
const electronBuilder = require('electron-builder');

const DROPBOX_TOKEN = process.env.DROPBOX_TOKEN;
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_USER = process.env.GITHUB_USER;

const isTravisCi = process.env.TRAVIS === 'true';
const isPullRequest = process.env.TRAVIS_PULL_REQUEST !== 'false';
const commitish = process.env.TRAVIS_COMMIT || null;
const tagName = process.env.TRAVIS_TAG || null;
const branchName = process.env.TRAVIS_BRANCH;
const isOsx = process.env.TRAVIS_OS_NAME === 'osx';
const platformsToBuild = isOsx ? 'm' : 'lw';
const versionFromTagName = semver.valid(tagName);
const buildVersion = versionFromTagName || semver.valid(pkg.version);
const mainVersion = [semver.major(buildVersion), semver.minor(buildVersion), semver.patch(buildVersion)].join('.');
const prereleaseChannel = (semver.prerelease(buildVersion) || [])[0];
const isBeta = prereleaseChannel === 'beta';
const shouldRelease = isTravisCi && !!versionFromTagName;

if (shouldRelease) {
  checkReleasePreConditions();
}

const artifactNames = {
  linux: `${pkg.name}-${buildVersion}-linux-x86_64.AppImage`,
  win: `${pkg.name}-${buildVersion}-windows.exe`,
  osx: `${pkg.name}-${buildVersion}-osx.dmg`
};

const buildConfig = {
  appId: isBeta ? 'de.anavis.beta' : 'de.anavis',
  productName: isBeta ? 'AnaVis Beta' : 'AnaVis',
  electronVersion: '1.8.1',
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
  return gulp.src(['package.json', 'app/package.json'], { base: '.' })
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
  const dbx = new Dropbox({ accessToken: DROPBOX_TOKEN });
  return dbx.filesDownload({ path: source })
    .then(data => fs.writeFileSync(target, data.fileBinary, 'binary'));
}

function getLatestGithubRelease(githubAuth, owner, repo) {
  return new Promise((reject, resolve) => {
    gh.getLatest(githubAuth, owner, repo, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

function createGithubRelease(githubAuth, owner, repo, data) {
  return new Promise((reject, resolve) => {
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
  return new Promise((reject, resolve) => {
    gh.uploadAssets(githubAuth, owner, repo, releaseId, files, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

function checkReleasePreConditions() {
  if (branchName !== 'master' || !versionFromTagName) {
    throw new Error('Branch is not master or there is no version tag, will exit the script.');
  }

  if (mainVersion !== pkg.version) {
    throw new Error(`Tag version ${versionFromTagName} does not correspond to package version ${pkg.version}.`);
  }

  if (prereleaseChannel && prereleaseChannel !== 'beta') {
    throw new Error(`Tag version ${versionFromTagName} does not fulfill version name constraints.`);
  }
}

function createReleaseNotes(commits) {
  return commits.map(c => `* ${markdownEscape(c.subject)}`).join('\n');
}
