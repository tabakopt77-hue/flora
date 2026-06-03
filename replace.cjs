const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filepath = path.join(dir, file);
        if (fs.statSync(filepath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
                filelist = walkSync(filepath, filelist);
            }
        } else {
            if (filepath.match(/\.(tsx|ts|html|json|md)$/)) {
                filelist.push(filepath);
            }
        }
    }
    return filelist;
};

const files = walkSync('.');
for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.match(/Aura Flora/gi)) {
        content = content.replace(/Aura Flora/g, 'Floramos');
        content = content.replace(/AURA FLORA/g, 'FLORAMOS');
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
    }
}
