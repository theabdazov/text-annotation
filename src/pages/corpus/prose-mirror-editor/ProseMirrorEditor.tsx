import { EditorState, Transaction } from 'prosemirror-state';
import { ProseMirror } from '@nytimes/react-prosemirror';
import React, { useEffect, useState } from 'react';
import { Node, Schema } from 'prosemirror-model';
import { Entity, Segment } from '../../../modes';
import './ProseMirrorEditor.css'
import EntitiesList from '../entities-list/Entities-list';
import { EditorView } from 'prosemirror-view';

const ent_colors = ['#ffcc88', '#85ebeb', '#c78bff', '#a1a1f6']

function compareRanges(a: Entity, b: Entity): number {
    return a.start - b.start
}

interface ProseMirrorEditorProps {
    segment: Segment,
    onChanged: (newSegment: Segment) => void
}

function convert(segment: Segment, entitiesList: string[]) {
    const content = [];
    let cursor = 0;
    segment.entities.sort(compareRanges).forEach(entity => {
        if (cursor < entity.start) {
            content.push({
                type: 'textBlock',
                content: [{
                    type: 'text',
                    text: segment.text.slice(cursor, entity.start)
                }],
            })
            cursor = entity.start + entity.length
        }
        content.push({
            type: 'entBlock',
            content: [{
                type: 'text',
                text: segment.text.slice(entity.start, entity.start + entity.length)
            }],
            attrs: {color: ent_colors[entitiesList.lastIndexOf(entity.name)], name: entity.name},
        })
        cursor = entity.start + entity.length
    })

    if (cursor < segment.text.length) {
        content.push({
            type: 'textBlock',
            content: [{
                type: 'text',
                text: segment.text.slice(cursor, segment.text.length)
            }],
        })
    }
    return {
        type: 'doc',
        content: content
    }

}

function revertConvert(jsonModel: EditorJsonModel): Segment {
    let text = ''
    const entity: Entity[] = []

    jsonModel.doc.content.forEach(node => {
        const nodeText = node.content[0].text
        if (node.type === 'entBlock') {
            entity.push({
                name: node.attrs.name,
                start: text.length,
                length: nodeText.length
            })
        }
        text += nodeText;
    })

    return {
        entities: entity,
        text: text
    }
}


const schema = new Schema({
    nodes: {
        doc: {content: 'block*'},
        entBlock: {
            defining: false,
            content: 'text*',
            toDOM: (node) => ['div', {class: 'editor-block ent', style: `background-color: ${node.attrs.color}`}, 0],
            attrs: {
                color: {
                    default: 'transparent',
                },
                name: {
                    default: 'ent_name'
                }
            },
            group: 'block'
        },
        textBlock: {
            defining: false,
            content: 'text*',
            toDOM: (node) => ['div', {class: 'editor-block'}, 0],
            group: 'block'
        },
        text: {
            inline: true,
        }
    }
});

interface EditorJsonModel {
    doc: {
        content: [{
            type: 'entBlock' | 'textBlock',
            attrs: {
                color: string;
                name: string;
            }
            content: [{
                type: 'text',
                text: string
            }]
        }]
    }
}


function ProseMirrorEditor({ segment, onChanged}: ProseMirrorEditorProps) {

    const [mount, setMount] = useState<HTMLElement | null>(null);

    const [entities, setEntities] = useState<string[]>(['Measurement unit', 'Untranslatables']);

    const [editorState, setEditorState] = useState(
        EditorState.create({schema: schema})
    );

    useEffect(() => {
        const updateContent = () => {
            const state = EditorState.create({schema: schema, doc: schema.nodeFromJSON(convert(segment, entities))});
            setEditorState(state);
        };

        updateContent();
    }, [segment, entities]);

    const getSelectionText = (state: EditorState): string => {
        const selection = state.selection;

        if (!selection.empty) {
            const {from, to} = selection;
            return state.doc.textBetween(from, to);
        }
        return ''
    }

    const addEnt = (ent: string) => {
        replaceWith(editorState.selection.from, editorState.selection.to, schema.nodes.entBlock.create({
            name: ent,
            color: ent_colors[entities.lastIndexOf(ent)]
        }, editorState.schema.text(getSelectionText(editorState))))

    }

    const transactionHandler = (transaction: Transaction) => {
        setEditorState((s) => s.apply(transaction));
    }

    const handleClickOn: any = (view: EditorView, pos: number, node: Node, nodePos: number, event: MouseEvent, direct: boolean): boolean | void => {
        if (node.type.name !== 'entBlock') {
            return
        }
        replaceWith(nodePos, nodePos + node.content.size + 1, view.state.schema.nodes.textBlock.create({}, view.state.schema.text(node.textContent)))
    }

    const replaceWith = (from: number, to: number, newNode: Node): void => {
        const tr = editorState.tr.replaceRangeWith(from, to, newNode);
        const newState = editorState.apply(tr)
        onChanged(revertConvert(newState.toJSON()));
        setEditorState(newState);
    }



    return (
        <>
            <EntitiesList initialEntities={entities} colors={ent_colors} onClick={addEnt}/>
            <ProseMirror
                mount={mount}
                state={editorState}
                dispatchTransaction={transactionHandler}
                handleClickOn={handleClickOn}
            >
                <div ref={setMount}/>
            </ProseMirror>
        </>
    );
}

export default ProseMirrorEditor
