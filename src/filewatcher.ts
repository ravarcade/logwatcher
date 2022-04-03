'use strict';

import sanitize = require('sanitize-filename');
import * as vscode from 'vscode';

// ikony: https://microsoft.github.io/vscode-codicons/dist/codicon.html

let watcher: vscode.FileSystemWatcher;
let files: string[];
let exts: string[];
let statusBars: vscode.StatusBarItem[];
let statusBarMsg : vscode.StatusBarItem;

// export async function activate(_context: vscode.ExtensionContext) {
export async function activate(context: vscode.ExtensionContext) {
    console.log("Start watcher");
    setupWatcher(context);
}

export async function deactivate() {
    if (watcher !== undefined) {
        watcher.dispose();
    }
}

// *** watcher ***
function setupWatcher(context: vscode.ExtensionContext): void {
    let cfg = vscode.workspace.getConfiguration('', null);
    let ext = sanitize(cfg.get("conf.files.ext", "out,k3.txt"));
    let pat = cfg.get("conf.files.pattern", "**/sctworkingdir/*/log/*-0");
    let fullWatchedPattern = `${pat}.{${ext}}`;
    console.log("watching: " + fullWatchedPattern);
    exts = ext.split(',');
    files = new Array(exts.length);
    statusBars = new Array(exts.length);

    exts.map(s => s.trim());
    files.map(f => f = '');
    for (let i = 0; i < exts.length; ++i) {
        let ext = exts[i];
        statusBars[i] = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        statusBars[i].text = `$(rocket) ${ext}`;
        statusBars[i].tooltip = `$(rocket) nope`;
        statusBars[i].hide();

        const cmdId = 'logwatcher.openLast_' + exts[i];
        context.subscriptions.push(vscode.commands.registerCommand(cmdId, () => {
            openLog(i);
        }));
        statusBars[i].command = cmdId;
        context.subscriptions.push(statusBars[i]);
    }

    watcher = vscode.workspace.createFileSystemWatcher(fullWatchedPattern);
    watcher.onDidCreate(uri => {
        let i = getSlot(uri.fsPath);
        if (i !== null) {
            files[i] = uri.fsPath;
            updateStatusBar(i);
        }
    });

    watcher.onDidDelete(uri => {
        let i = getSlot(uri.fsPath);
        if (i !== null) {
            files[i] = '';
            updateStatusBar(i);
        }
    });

    statusBarMsg = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarMsg.text = `$(rocket) ${ext}`;
    statusBarMsg.tooltip = `Waiting for new files in: ${pat}`;
    statusBarMsg.show();
    context.subscriptions.push(statusBarMsg);
}

function openLog(i: number) {
    if (files.length > i && files[i].length > 0)
    { 
        openFile(files[i], 0);
    }
}

function updateStatusBar(i: number) {
    statusBarMsg.hide();
    if (files[i].length > 0) {
        statusBars[i].tooltip = files[i];
        statusBars[i].show();
    }
    else {
        statusBars[i].hide();
    }
}

function getSlot(fileName: string): number | null {
    for (let i = 0; i < exts.length; ++i) {
        if (fileName.endsWith(exts[i])) {
            return i;
        }
    }

    return null;
}

function openFile(filename: string, line: number, column: number = 0) {
    var fileUri: vscode.Uri = vscode.Uri.file(filename);
    vscode.workspace.openTextDocument(fileUri).then((doc: vscode.TextDocument) => {
        vscode.window.showTextDocument(doc).then(_e => {
            let activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                const position = activeEditor.selection.active;

                var newPosition = position.with(line - 1, column);
                var newSelection = new vscode.Selection(newPosition, newPosition);
                activeEditor.selection = newSelection;
                activeEditor.revealRange(newSelection);
            }
        });
    }, (error: any) => {
        // console.error(error);
        // debugger;
    });
}
