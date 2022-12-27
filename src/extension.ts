import * as vscode from 'vscode';
import * as filewatcher from './filewatcher';
import { window } from 'vscode';

// const colors : string[] = ["#539741", "#4a588a", "#cd4c46", "#8d6fd1", "#71afe2" ];
const cpTarget = vscode.ConfigurationTarget.Workspace;

function getColors() : string[]
{
    let cfg = vscode.workspace.getConfiguration('', null);
    let colorsTxt = cfg.get("conf.mark.colors", "#437731,#3a4861a,#9d3c36,#7d5fa1,#618fb2");
	return colorsTxt.split(',');
}

function countRavTags(cp : any[]) : number
{
	return cp.filter(item => item["ravTag"] === true).length;
}

function selectColor(cp : any[]) : string
{
	let colors = getColors();
	return colors[(countRavTags(cp)+1) % colors.length].trim();
}

async function enterText()
{
	return await window.showInputBox({
		value: '',
		placeHolder: 'Enter text to highlight',
		validateInput: text => {
			return text.length < 3 ? 'too short!' : null;
		}
	});	
}

async function selectPatt(cp : any[])
{
	const opt : {label: string, description: string}[] = cp.filter(it => it["ravTag"] === true).map((it) => {
		const patt = it["pattern"];
		return {label: patt, description: ''};
	});
	if (opt.length > 0)
	{
		const tg = await vscode.window.showQuickPick(opt, { placeHolder: 'Select what highlight to remove' });
		return tg?.label;
	}
	return undefined;
}

export function activate(context: vscode.ExtensionContext) {
	let ext = vscode.workspace.getConfiguration().get("conf.files.ext");
	console.log(ext);
	console.log('Congratulations, your extension "logwatcher" is now active!');

	context.subscriptions.push(vscode.commands.registerCommand('logwatcher.addHighlight', async () => {
		let cfg = vscode.workspace.getConfiguration('logFileHighlighter');
		let cp = cfg?.get<any[]>('customPatterns');
		const patt = cp ? await enterText() : null;

		if (cfg && cp && patt)
		{
			const col = selectColor(cp);
			cp.push({ 'ravTag' : true, 'pattern': patt, "foreground": "#efefef", "background": col, "overviewColor": col, "overviewRulerLane": "Full" });
			cfg.update('customPatterns', cp, cpTarget);
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('logwatcher.removeHighlight', async () => {
		let cfg = vscode.workspace.getConfiguration('logFileHighlighter');
		let cp = cfg?.get<any[]>('customPatterns');

		if (cfg && cp)
		{
			const patt = await selectPatt(cp);
			if (patt)
			{
				cfg.update('customPatterns', cp?.filter(it => it["ravTag"] !== true || (it["ravTag"] === true && it["pattern"] !== patt) ), cpTarget);
			}
		}
	}));

	context.subscriptions.push(vscode.commands.registerCommand('logwatcher.clearHighlight', () => {
		let cfg = vscode.workspace.getConfiguration('logFileHighlighter');
		let cp = cfg?.get<any[]>('customPatterns');
		if (cfg && cp)
		{
			cfg.update('customPatterns', cp.filter(it => it["ravTag"] !== true), cpTarget);
		}
	}));
	filewatcher.activate(context);
}

export function deactivate() {
	filewatcher.deactivate();
}