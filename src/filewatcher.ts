'use strict';

import sanitize = require('sanitize-filename');
import * as vscode from 'vscode';
// import * as path from 'path';
// import * as fs from 'fs';

let watcher: vscode.FileSystemWatcher;

export async function activate(_context: vscode.ExtensionContext) {
    console.log("Start watcher");
    let cfg = vscode.workspace.getConfiguration('', null);
    let ext = sanitize(cfg.get("conf.files.ext", "log"));
    watcher = vscode.workspace.createFileSystemWatcher(`**/*.{${ext}}*`);

    watcher.onDidCreate(uri =>{
        console.log("new log: " + uri.fsPath);
    });

    watcher.onDidDelete(uri => {
            console.log("del log: " + uri.fsPath);
    });
}

export async function deactivate() {
    if (watcher !== undefined) {
        watcher.dispose();
    }
}