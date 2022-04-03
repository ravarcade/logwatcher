import * as vscode from 'vscode';
import * as filewatcher from './filewatcher';

export function activate(context: vscode.ExtensionContext) {
	let ext = vscode.workspace.getConfiguration().get("conf.files.ext");
	console.log(ext);
	console.log('Congratulations, your extension "logwatcher" is now active!');

	filewatcher.activate(context);
}

export function deactivate() {
	filewatcher.deactivate();
}