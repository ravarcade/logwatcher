'use strict';

import sanitize = require('sanitize-filename');
import * as vscode from 'vscode';
import { log } from './logger';
import { selectFileToOpen } from './pickFile';

// ikony: https://microsoft.github.io/vscode-codicons/dist/codicon.html
// https://stackoverflow.com/questions/34286515/how-to-install-visual-studio-code-extensions-from-command-line
// https://github.com/microsoft/vscode/issues/146182

let watcher: vscode.FileSystemWatcher;
let statusBarMsg: vscode.StatusBarItem;
let files: string[];
let exts: string[];
let statusBars: vscode.StatusBarItem[];
let commands: vscode.Disposable[];

// export async function activate(_context: vscode.ExtensionContext) {
export async function activate(context: vscode.ExtensionContext) {
    log("Start watcher");
    setupWatcher(context);
    setupConfigChange(context);
}

export async function deactivate() {
    if (watcher !== undefined) {
        watcher.dispose();
    }
}

// *** config change ***
function setupConfigChange(context: vscode.ExtensionContext): void {
    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('conf.files.ext') || e.affectsConfiguration('conf.files.pattern')) {
            restartWatcher(context);
        }
    }));
}

// *** watcher ***
function setupWatcher(context: vscode.ExtensionContext): void {
    setupWatcherObjects(context);
}

function restartWatcher(context: vscode.ExtensionContext): void {
    watcher.dispose();
    statusBarMsg.dispose();

    for (let i = 0; i < exts.length; ++i) {
        statusBars[i].dispose();
        commands[i].dispose();
    }

    setupWatcherObjects(context);
}

function setupWatcherObjects(context: vscode.ExtensionContext): void {
    let cfg = vscode.workspace.getConfiguration('', null);
    let ext = sanitize(cfg.get("conf.files.ext", "out,k3.txt"));
    let pat = cfg.get("conf.files.pattern", "**/sctworkingdir/*/logs/**/*");
    let fullWatchedPattern = `${pat}.{${ext}}`;
    log("watching: " + fullWatchedPattern);
    exts = ext.split(',');
    files = new Array(exts.length);
    statusBars = new Array(exts.length);
    commands = new Array(exts.length);

    exts.map(s => s.trim());
    for (let i = 0; i < exts.length; ++i) {
        files[i] = '';
        let ext = exts[i];
        statusBars[i] = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        statusBars[i].text = `$(rocket) ${ext}`;
        statusBars[i].tooltip = `$(rocket) nope`;
        statusBars[i].hide();

        const cmdId = 'logwatcher.openLast_' + exts[i];
        commands[i] = vscode.commands.registerCommand(cmdId, () => {
            openLog(i);
        });
        context.subscriptions.push(commands[i]);
        statusBars[i].command = cmdId;
        context.subscriptions.push(statusBars[i]);
    }

    watcher = vscode.workspace.createFileSystemWatcher(fullWatchedPattern);
    watcher.onDidCreate(uri => {
        log("create: ", uri.fsPath);
        let i = getSlot(uri.fsPath);
        if (i !== null) {
            files[i] = uri.fsPath;
            updateStatusBar(i);
        }
    });

    watcher.onDidDelete(uri => {
        log("delete: ", uri.fsPath);
        let i = getSlot(uri.fsPath);
        if (i !== null) {
            files[i] = '';
            updateStatusBar(i);
        }
    });

    const cmdId = 'logwatcher.openResultDialog';
    vscode.commands.registerCommand(cmdId, () => {
        selectFileToOpen(exts, files);
    });
    statusBarMsg = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    statusBarMsg.text = `$(rocket) ${ext}`;
    statusBarMsg.tooltip = `Waiting for new files in: ${pat}`;
    statusBarMsg.command = cmdId;
    statusBarMsg.show();
    context.subscriptions.push(statusBarMsg);
}

function openLog(i: number) {
    if (files.length > i && files[i].length > 0) {
        openFile(files[i], 0);
    }
}

function updateStatusBar(_i: number) {
    // statusBarMsg.hide();
    // if (files[i].length > 0) {
    //     statusBars[i].tooltip = files[i];
    //     statusBars[i].show();
    // }
    // else {
    //     statusBars[i].hide();
    // }
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
    }, (_error: any) => {
        // console.error(error);
        // debugger;
    });
}
