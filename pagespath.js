const glob = require('glob');
const path = require('path');
function getView(globPasth){
    let files = glob.sync(globPasth);
    let entries = {},
        entry,
        dirname,
        basename,
        pathname,
        extname;
    files.forEach(item=>{
        entry = item;
        dirname = path.dirname(entry);//当前目录,不包含文件
        extname = path.extname(entry);//文件后缀
        basename = path.basename(entry,extname);//文件得名字，不带后缀得文件名字
        pathname = path.join(dirname,basename);//文件路径
        if(extname ==='.html'){
            entries[pathname] = './'+ entry;
        }else{
            entries[basename] = entry
        }
    });
    return entries
};
module.exports = {
    getView:getView,
}