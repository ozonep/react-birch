import Filer from 'filer';

class PromisedFS {
    constructor(fs) {
        this.fs = fs
    };

    writeFile = (path, data) => new Promise((res, rej) => {
        this.fs.writeFile(path, data || '', {
            encoding: 'utf8',
            flag: "w+"
        }, (err) => err ? rej(err) : res())
    });

    mkdir = (path) => new Promise((res, rej) => {
        this.fs.mkdir(path, (err) => err ? rej(err) : res())
    });

    readdir = (path) => new Promise((res, rej) => {
        this.fs.readdir(path, (err, files) => err ? rej(err) : res(files))
    });

    stat = (path) => new Promise((res, rej) => {
        this.fs.stat(path, (err, stats) => err ? rej(err) : res(stats))
    });

    mv = (source, dest) => new Promise((res, rej) => {
        this.fs.rename(source, dest, (renameErr) => {
            if (renameErr) {
                this.fs.link(source, dest, (linkErr) => {
                    if (linkErr) rej(linkErr);
                    this.fs.unlink(source, (unlinkErr) => unlinkErr ? rej(unlinkErr) : res())
                })
            } else {
                res()
            }
        })
    })
}

export async function initFS(mountPoint) {
    const treeTemplate = {
        'index.js': '',
        'etc': {
            'lib': {},
            '.apps': {
                'timer': {
                    'package.json': '',
                    'src': {
                        'components': {
                            'main.ts': '',
                            'header.ts': '',
                            'footer.ts': ''
                        },
                        'styles': {
                            'main.css': '',
                            'index.css': ''
                        }
                    },
                },
                'devtools': {
                    'www': {
                        'index.html': '',
                        'index.css': '',
                        'main.js': '',
                    },
                    'var': {
                        'debug.log': '',
                        'yarn.lock': ''
                    },
                    'package.json': ''
                }
            },
        },
        'usr': {
            'apps': {
                'zip': '',
                'md5sum': '',
                'sha256sum': '',
                'package.json': '',
                'lodash.js': '',
                'lodash.min.js': '',
            },
        },
        '.trash': {
            'zip': '',
            'md5sum': '',
            'sha256sum': '',
            'package.json': '',
            'lodash.js': '',
            'lodash.min.js': '',
        }
    };

    const loadFS = () => new Promise((res, rej) => {
        new Filer.FileSystem({
            name: "diggit-fs",
            flags: ['FORMAT'],
            provider: new Filer.FileSystem.providers.Memory()
        }, (err, fs) => err ? rej(err) : res(fs));
    });

    const Path = Filer.Path;

    const fillFS = async (fs) => {
        const fill = async (path, tree) => {
            for (let filename in tree) {
                const node = tree[filename];
                const _path = Path.join(path, filename);
                if (typeof node !== 'string') {
                    await fs.mkdir(_path);
                    await fill(_path, node)
                } else {
                    await fs.writeFile(_path)
                }
            }
        };
        await fs.mkdir(mountPoint);
        return fill(mountPoint, treeTemplate)
    };
    const fs = new PromisedFS(await loadFS());
    await fillFS(fs);
    return fs
}