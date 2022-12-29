'use strict';

import { Uri, window, workspace, TextDocument, Selection/*, QuickPickItem*/ } from 'vscode';


export async function selectFileToOpen(exts: string[], files: string[]) {
    // let fnames = files.map((fullPath)=>{ return new QuickPickItem
    //     { label: 'User', description: fullPath.replace(/^.*[\\\/]/, ''), target: fullPath }} );
    // let mapToExt = files.reduce(function(result: Record<string, string>, field, index) {
    //     result[field] = exts[index];
    //     return result;
    //   }, {});

    // let i = 0;
    const result = await window.showQuickPick(
        files.map((fullPath: string, index: number) => {
            const detail = fullPath ? fullPath.replace(/^.*[\\\/]/, '') : " --- ";
            return {
                label: exts[index],
                detail: detail,
                target: fullPath
            };
        }),
        {
            placeHolder: 'Select file',
        }
    );
    if (result) { openFile(result.target,0); }
}

function openFile(filename: string, line: number, column: number = 0) {
    var fileUri: Uri = Uri.file(filename);
    workspace.openTextDocument(fileUri).then((doc: TextDocument) => {
        window.showTextDocument(doc).then(_e => {
            let activeEditor = window.activeTextEditor;
            if (activeEditor) {
                const position = activeEditor.selection.active;

                var newPosition = position.with(line - 1, column);
                var newSelection = new Selection(newPosition, newPosition);
                activeEditor.selection = newSelection;
                activeEditor.revealRange(newSelection);
            }
        });
    }, (_error: any) => {
        // console.error(error);
        // debugger;
    });
}