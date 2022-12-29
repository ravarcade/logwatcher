'use strict';

import * as vscode from 'vscode';
import { window } from 'vscode';

export async function activate(context: vscode.ExtensionContext) {
    setupMarker(context);
}

export async function deactivate() {
}

export function onDidChangeConfiguration(_context: vscode.ExtensionContext): void {
    refreshColors();
}

function setupMarker(context: vscode.ExtensionContext): void {
    context.subscriptions.push(vscode.commands.registerCommand('logwatcher.addHighlight', async () => {
		let cfg = vscode.workspace.getConfiguration('logFileHighlighter');
		let cp = cfg?.get<any[]>('customPatterns');
		const patt = cp ? await enterText() : null;

		if (cfg && cp && patt && isUniq(cp, patt))
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
}

const cpTarget = vscode.ConfigurationTarget.Workspace;

function getColors() : string[]
{
    let cfg = vscode.workspace.getConfiguration('', null);
    let colorsTxt = cfg.get("conf.mark.colors", "#437731,#3a486a,#9d3c36,#7d5fa1,#618fb2");
	let out = colorsTxt.split(',');
    if (out.length === 0)
    {
        out = ["#cf1bb1"];
    }
    return out;
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

function isUniq(cp : any[], patt : string) : boolean
{
	return cp ? cp.filter(item => item["ravTag"] === true && item["pattern"] === patt).length === 0 : false;
}

async function enterText()
{
	const editor = vscode.window.activeTextEditor;
	const selectedText = editor?.document.getText(editor.selection);
	return await window.showInputBox({
		value: selectedText,
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

function refreshColors()
{
    let cfg = vscode.workspace.getConfiguration('logFileHighlighter');
    let cp = cfg?.get<any[]>('customPatterns');
    if (cfg && cp)
    {
        let colIdx = 0;
        let colors = getColors();
        cp.forEach((value: any, index: number, out: any[]) => {
            if (value["ravTag"] === true)
            {
                const col = colors[colIdx % colors.length].trim();
                ++colIdx;
                value['background'] = col;
                value['foreground'] = "#efefef";
                value['overviewColor'] = col;
                out[index] = value;
            }
        });
        cfg.update('customPatterns', cp, cpTarget);
    }}