'use strict';

import sanitize = require('sanitize-filename');
import * as vscode from 'vscode';
// import * as path from 'path';
// import * as fs from 'fs';

// ikony: https://microsoft.github.io/vscode-codicons/dist/codicon.html

let watcher: vscode.FileSystemWatcher;
let statusBarK3: vscode.StatusBarItem;
let statusBarOut: vscode.StatusBarItem;

// export async function activate(_context: vscode.ExtensionContext) {
export async function activate(_context: vscode.ExtensionContext) {
    console.log("Start watcher");
    setupWatcher(_context);
    setupStatusBar(_context);
}

export async function deactivate() {
    if (watcher !== undefined) {
        watcher.dispose();
    }
}
// *** status bar ***
function setupStatusBar(context: vscode.ExtensionContext): void {
    const statusBarK3Id = 'logwatcher.onStatusBarK3Click';
    const statusBarOutId = 'logwatcher.onStatusBarOutClick';
	
    context.subscriptions.push(vscode.commands.registerCommand(statusBarK3Id, () => {
        openK3();
	}));

    context.subscriptions.push(vscode.commands.registerCommand(statusBarOutId, () => {
        openOut();
	}));

    statusBarK3 = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarK3.command = statusBarK3Id;

    statusBarOut = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
	statusBarOut.command = statusBarOutId;


	context.subscriptions.push(statusBarK3);
	context.subscriptions.push(statusBarOut);

    // register some listener that make sure the status bar 
	// item always up-to-date
	// context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor(updateStatusBarItem));
	// context.subscriptions.push(vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem));

    // updateStatusBarItem();
}

// *** watcher ***
function setupWatcher(_context: vscode.ExtensionContext): void {
    let cfg = vscode.workspace.getConfiguration('', null);
    let ext = sanitize(cfg.get("conf.files.ext", "k3.txt"));
    watcher = vscode.workspace.createFileSystemWatcher(`**/*.{${ext}}*`);
    watcher.onDidCreate(uri =>{
        showQuickPick();
        console.log("new log: " + uri.fsPath);
        setStatusBar(uri.fsPath);
        // openFile('c:/Work/tezt-grantt.mmd', 15);
    });

    watcher.onDidDelete(uri => {
        showInputBox();
        console.log("del log: " + uri.fsPath);
        setStatusBar(uri.fsPath);
    });
}

function openK3()
{
    openFile('c:/Work/tezt-grantt.mmd', 15);
}

function openOut()
{
    openFile('c:/Work/tezt-grantt.mmd', 5);
}

function openFile(filename: string, line: number, column: number  = 0) {
    var fileUri: vscode.Uri = vscode.Uri.file(filename);
    vscode.workspace.openTextDocument(fileUri).then((doc: vscode.TextDocument) => {
        vscode.window.showTextDocument(doc).then(_e => {
            let activeEditor = vscode.window.activeTextEditor;
            if (activeEditor) {
                const position = activeEditor.selection.active;
        
                var newPosition = position.with(line-1, column);
                var newSelection = new vscode.Selection(newPosition, newPosition);
                activeEditor.selection = newSelection;
                activeEditor.revealRange(newSelection);
            }
        });
    }, (error: any) => {
        console.error(error);
        debugger;
    });
}

function setStatusBar(filename: string)
{
    if (filename.endsWith('.k3.txt'))
    {
        statusBarK3.text = `$(circuit-board) ${filename}`;
        statusBarK3.show();
    }
    if (filename.endsWith('.out'))
    {
        statusBarOut.text = `$(rocket) ${filename}`;
        statusBarOut.show();
    }
}
// *** helper functions ***
// function updateStatusBarItem(): void {
// 	const n = getNumberOfSelectedLines(vscode.window.activeTextEditor);
// 	if (n > 0) {
// 		statusBar.text = `$(checklist) ${n} line(s) selected`;
// 		statusBar.show();
//         statusBar.color = '#33AA33';
//         statusBar.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
// 	} else {
// 		statusBar.hide();
// 	}
// }

// function getNumberOfSelectedLines(editor: vscode.TextEditor | undefined): number {
// 	let lines = 0;
// 	if (editor) {
// 		lines = editor.selections.reduce((prev, curr) => prev + (curr.end.line - curr.start.line), 0);
// 	}
// 	return lines;
/**
 * Shows a pick list using window.showQuickPick().
 */
 export async function showQuickPick() {
	let i = 0;
	const result = await vscode.window.showQuickPick(['eins', 'zwei', 'drei'], {
		placeHolder: 'eins, zwei or drei',
		onDidSelectItem: item => vscode.window.showInformationMessage(`Focus ${++i}: ${item}`)
	});
	vscode.window.showInformationMessage(`Got: ${result}`);
}

/**
 * Shows an input box using window.showInputBox().
 */
export async function showInputBox() {
	const result = await vscode.window.showInputBox({
		value: 'abcdef',
		valueSelection: [2, 4],
		placeHolder: 'For example: fedcba. But not: 123',
		validateInput: text => {
			vscode.window.showInformationMessage(`Validating: ${text}`);
			return text === '123' ? 'Not 123!' : null;
		}
	});
	vscode.window.showInformationMessage(`Got: ${result}`);
}