import * as vscode from 'vscode';
import * as filewatcher from './filewatcher';

export function activate(context: vscode.ExtensionContext) {
	let ext = vscode.workspace.getConfiguration().get("conf.files.ext");
	console.log(ext);
	console.log('Congratulations, your extension "logwatcher" is now active!');

	let disposable = vscode.commands.registerCommand('logwatcher.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from logwatcher!');
	});
	context.subscriptions.push(disposable);
	
	filewatcher.activate(context);
}

export function deactivate() {
	filewatcher.deactivate();
}
