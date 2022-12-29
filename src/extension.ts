import * as vscode from 'vscode';
import * as filewatcher from './filewatcher';
import * as marker from './marker';

export function activate(context: vscode.ExtensionContext) {
	let ext = vscode.workspace.getConfiguration().get("conf.files.ext");
	console.log(ext);
	console.log('Congratulations, your extension "logwatcher" is now active!');

	filewatcher.activate(context);
	marker.activate(context);
	context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('conf.files.ext') || e.affectsConfiguration('conf.files.pattern')) {
            filewatcher.onDidChangeConfiguration(context);
        }
        else if(e.affectsConfiguration('conf.mark.colors')) {
            marker.onDidChangeConfiguration(context);
        }
    }));
}

export function deactivate() {
	filewatcher.deactivate();
	marker.deactivate();
}