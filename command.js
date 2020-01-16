#! /usr/bin/env node

const commander = require('commander');
const inquirer = require('inquirer');
const clone = require('git-clone');
const log = require('tracer').colorConsole();
const shell = require('shelljs');
const path = require('path');
const fs = require('fs');
const { projectUrl, questions, pageQuestions, componentsQuestions, getComponentsFiles } = require('./config/baseConfig.js')
const { generateModule, generateComponent } = require('./config/baseFunc.js')
const modulesFileContent = ['data.js', 'index.js', 'vx.js', '__className__.vue']

/**
 * 引入commander展示版本号
 **/
commander.version('1.0.0')
  .option('-c, --component', 'Add component')
  .option('-p, --page', 'Add page')
/**  
 * 初始化
 */
commander
.command('init')
  .description('用来初始化项目, 拉取模板')
  .action(() => {
  console.log('正在构建...')
  inquirer.prompt(questions)
  .then(answers => {
      const { projectName, type } = answers
      console.log(projectName)
      console.log(type)
      clone(`${projectUrl[type]}`, `./${projectName}`,null, function() {
        log.info('星系构建完成')
        shell.rm('-rf', `./${projectName}/.git`);
        log.info(`清除掉${projectName}的git, 记得进入项目npm install`)
      })
    })  
})

/**
 * 更新物料
 * */
commander
  .command('update')
  .description('更新物料库')
  .action(() => {
    let pwd = shell.pwd()
    shell.cd(__dirname)
    shell.exec('rm -rf .git')
    const updateFiles = () => {
      shell.cd(path.join(__dirname, '/material/generate_components'))
      shell.rm('-rf', '*')
      shell.cd(path.join(__dirname, '/material/generate_modules'))
      shell.rm('-rf', '*')
      shell.cd(__dirname)
      shell.exec('git pull origin master')
    }

    shell.exec('git init')
    shell.exec('git remote add origin https://github.com/murongqimiao/joao-website.git') // 物料仓库
    shell.exec('git config core.sparseCheckout true')
    shell.exec("echo 'material' >> .git/info/sparse-checkout")
    updateFiles()


  })

/**
 * add 命令添加物料
 **/
commander
  .command('add [args...]')
  .description('增加物料 -c 组件  -p 页面')
  .action((args) => {
    // 缺少参数
    if (!commander.component && !commander.page) {
      log.warn('缺少参数-c或者-p, 以区分物料种类, 具体见--help')
    }
    // 增加组件
    if (commander.component) {
      let pwd = shell.pwd()
      args.map(componentType => {
        _componentType = getComponentsFiles().indexOf(componentType) > -1 ? componentType : getComponentsFiles().indexOf(componentType + '.vue') > -1 ? componentType + '.vue' : void 0
        if (!_componentType) {
          log.warn(`:${componentType}  --> 组件不存在, 请检查拼写`)
        } else {
          let _filePath = path.join(__dirname, `./material/generate_components/${_componentType}`)
          let _isFile = fs.statSync(_filePath).isFile()
          if (_isFile) {
            generateComponent(_componentType, '', pwd)
          } else {
            let _aimFiles = fs.readdirSync(_filePath)
            // 建文件夹
            fs.mkdir(`${pwd}/src/components/${_componentType}`, 0777, (err) => {
              if (err) {
                log.info(`${componentType}目录已经建立`)
              }
            })
            _aimFiles.map(item => {
              generateComponent(_componentType, `/${item}`, pwd)
            })
          }
        }
      })
    }
    // 增加页面
    if (commander.page) {
      inquirer.prompt(pageQuestions)
      .then(answers => {
        const  { modelType } = answers
        let pwd = shell.pwd()
        console.log(`commander.page`, args)
        args.map(pageName => {
          console.log('pageName', pageName)
          // 创建对应目录的文件夹
          if (pageName.split('/').length === 2) {
            fs.mkdir(`${pwd}/src/views/${pageName.split('/')[0]}`, 0755, (err) => {
              log.info(`${pageName.split('/')[0]}已存在`)
            })
          }
          fs.mkdir(`${pwd}/src/views/${pageName}`, 0755, (err) => {
            log.info(`${pageName}已存在`)
          })
          /* 读取./generate_modules下面的文件 */
          modulesFileContent.map(fileName => {
            generateModule(modelType, pageName, fileName, pwd)
          })
        })
      })
    }
  })


 // 目录数据查看
 commander
  .command('check')
  .description('查看物料目录内容')
  .action(() => {
    let components_url = path.join(__dirname,'./material/generate_components')
    let page_url = path.join(__dirname, './material/generate_modules')
    const _readdir = (url) => {
      return fs.readdir(url, (err, back) => {
        log.info(`${url}具有以下内容`)
        back.map(item => {
          console.log(item)
        })
      })
    }
    _readdir(components_url)
    _readdir(page_url)
  })

 // 清除数据
 commander
  .command('clear')
    .description('just a joke')
    .action(() => {
      log.info('正在给毁灭计时器上发条...')
      shell.rm('-rf', 'package.json');
      shell.rm('-rf', 'package-lock.json');
      shell.rm('-rf', 'node_modules/');
      shell.rm('-rf', 'command.js');
      log.info('Boom...一切又归于沉寂')
    })
  
commander.parse(process.argv)
