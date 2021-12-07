#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');
const chalk = require('chalk');

const positive = chalk.blue;
const negative = chalk.red;
const args = process.argv.slice(2);
const projectName = args[0];

const targetDirectory = process.cwd();
const workingDirectory = path.join(__dirname);

async function createProjectFiles(ora) {
    const spinner = ora('Creating project files').start();
    try {
        const indexHTML = fs.readFileSync(path.join(workingDirectory, '../', 'public', 'index.html'));

        spawnSync('mkdir', ['public'], {
            cwd: path.join(targetDirectory, projectName),
            shell: true,
        });

        fs.writeFileSync(path.join(targetDirectory, projectName, 'public', 'index.html'), indexHTML);

        spawnSync('mkdir', ['src'], {
            cwd: path.join(targetDirectory, projectName),
            shell: true,
        });

        fs.readdirSync(path.join(workingDirectory, '../', 'src')).forEach(file => {
            fs.copyFileSync(path.join(workingDirectory, '../', 'src', file), path.join(targetDirectory, projectName, 'src', file));
        });

        fs.copyFileSync(path.join(workingDirectory, '../', '.babelrc'), path.join(targetDirectory, projectName, '.babelrc'));
        fs.writeFileSync(path.join(targetDirectory, projectName, '.gitignore'), `
            node_modules
            .DS_Store
            build
        `)

        fs.copyFileSync(path.join(workingDirectory, '../', '.prettierrc'), path.join(targetDirectory, projectName, '.prettierrc'));
        fs.copyFileSync(path.join(workingDirectory, '../', 'webpack.config.js'), path.join(targetDirectory, projectName, 'webpack.config.js'));

        fs.copyFileSync(path.join(workingDirectory, '../', 'Readme.md'), path.join(targetDirectory, projectName, 'Readme.md'));

        spinner.succeed();
        console.log(positive('Success: ' + 'Project files created'));
    }
    catch(err) {
        spinner.fail();
        console.log(err)
        console.log(negative('Error: ' + 'Failed to create project files'));
        
        process.exit(1);
    }
}

async function installDependencies(projectName) {
    
    const ora = await (await import('ora')).default;

    const spinner = ora('Installing dependencies').start();

    const installDeps = spawn('npm', ['install'], {
        cwd: path.join(targetDirectory, projectName),
        shell: true,
    })

    installDeps.stdout.on('data', (data) => {
        spinner.text = data.toString();
    });

    installDeps.stderr.on('data', (data) => {
        spinner.text = data.toString();
        spinner.fail();
    });

    installDeps.on('exit', (code) => {
        if (code === 0) {
           
            spinner.succeed();
            spinner.text = 'Installed dependencies';
            console.log(positive('Success: ' + 'Dependencies installed'));
           
            createProjectFiles(ora);
        } else {
            
            spinner.fail();
            spinner.text = 'Failed to install dependencies';
            console.log(negative('Error: ' + 'Failed to install dependencies'));
            
            process.exit(1);
        }
    });
}

(async ()=>{

    const packageJson =  fs.readFileSync(path.join(workingDirectory, '../', 'package.json'));
    const packageJsonObject = JSON.parse(packageJson);

    delete packageJsonObject.bin;
    delete packageJsonObject.dependencies["chalk"];

    packageJsonObject.name = projectName;
    packageJsonObject.author = "";

    try {
        fs.mkdirSync(path.join(targetDirectory, projectName));
    }
    catch(err) {
        console.log(negative('Error: ' + 'Folder already exists'));
        process.exit(1);
    }

    fs.writeFileSync(path.join(targetDirectory, projectName, 'package.json'), JSON.stringify(packageJsonObject, null, 2));

    installDependencies(projectName);

})();