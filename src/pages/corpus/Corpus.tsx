import React, { useEffect, useState } from 'react';
import './Corpus.css';
import { AppShell, Navbar, Header } from '@mantine/core';
import { Segment } from '../../modes';
import SegmentList from './segment/Segment-list';
import ProseMirrorEditor from './prose-mirror-editor/ProseMirrorEditor';


function Corpus() {

    const [segments, setSegments] = useState<Segment[]>([]);

    useEffect(() => {
        const savedData = localStorage.getItem('segments');
        if (savedData) {
            setSegments(JSON.parse(savedData))
        }
    }, []);


    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const segmentSelectedHandler = (index: number | null) => {
        setSelectedIndex(index);
        if (index === null) {
            setSelectedSegment(null);
            return
        }
        setSelectedSegment(segments[index])
    }

    const [selectedSegment, setSelectedSegment] = useState<Segment | null>(null);

    const newSegmentAdded = (text: string) => {
        const newData = [...segments, {text, entities: []}]
        setSegments(newData)
        saveToStorage(newData);
    }

    const removeSegment = (index: number) => {
        const newData = segments.filter((item, i) => i !== index)
        setSegments(newData)
        saveToStorage(newData);
    }

    const selectedSegmentChanged = (newSegment: Segment) => {
        if (selectedIndex === null || selectedIndex === undefined) {
            return
        }
        segments[selectedIndex] = newSegment
        saveToStorage(segments);
        setSegments(segments)
    }

    const saveToStorage = (data: Segment[]) => {
        localStorage.setItem('segments', JSON.stringify(data));
    }

    const clearAllData = () => {
        setSegments([]);
        localStorage.setItem('segments', JSON.stringify([]));
    }


    return (
        <AppShell
            padding="md"
            navbar={<Navbar width={{base: 300}} p="xs">
                <SegmentList segments={segments} selectedItemIndex={selectedIndex}
                             onSelected={segmentSelectedHandler} segmentAdded={newSegmentAdded}
                             removeSegment={removeSegment} clearAllData={clearAllData}/>
            </Navbar>}
            header={<Header height={60} p="xs">{/* Header content */}</Header>}
            styles={(theme) => ({
                main: {backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[8] : theme.colors.gray[0]},
            })}
        >
            {
                selectedSegment ? <ProseMirrorEditor segment={selectedSegment} onChanged={selectedSegmentChanged}/> : ''
            }

        </AppShell>
    );
}

export default Corpus;
