const path = require('path');
const fs = require('fs');

// 项目地址
const projectUrl = {
  'empty-vue-template': 'https://github.com/murongqimiao/joao-template', // 空白库
} 

// util
const _getFileName = (url) => {
  let _url = path.join(__dirname, url)
  let _back = fs.readdirSync(_url)
  return _back
}
const modulesFiles = _getFileName('../material/generate_modules')
const componentsFiles = _getFileName('../material/generate_components')
const getComponentsFiles = () => {
  return _getFileName('../material/generate_components')
}

// 引入项目构建问题 
const questions = [
  {
   type: 'input',
   name: 'projectName',
   message: '请为项目命名',
   filter: function(val) {
      return val;
    }
  },
  {
   type: 'list',
   name: 'type',
   message: '请选择使用的模板',
   choices: Object.keys(projectUrl),
   filter: function(val) {
      return val.toLowerCase();
    }
  }
 ]

// 引入page构建问题
const pageQuestions = [
  {
   type: 'input',
   name: 'modelType',
   message: '请输入想要使用的页面种类',
   filter: function(val) {
      return val;
    }
  }
]
// 引入components构建问题
const componentsQuestions = [
  {
   type: 'list',
   name: 'componentType',
   message: '选择想要添加的组件',
   choices: componentsFiles,
   filter: function(val) {
      return val;
    }
  }
]


module.exports = { projectUrl, questions, pageQuestions, componentsQuestions, getComponentsFiles }