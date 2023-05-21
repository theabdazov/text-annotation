import { Segment } from '../../../modes';
import React, { MouseEvent } from 'react';
import './Segment-list.css'
import AddForm from '../segment-add/segment-add';

function exportToJsonFile(data: object[], fileName: string): void {
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], {type: 'application/json'});
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();

    // Clean up the URL object
    URL.revokeObjectURL(url);
}

interface SegmentListProps {
    segments: Segment[];
    selectedItemIndex: number | null;
    onSelected: (index: number | null) => void
    segmentAdded: (newText: string) => void
    removeSegment: (index: number) => void
    clearAllData: () => void
}


function SegmentList(props: SegmentListProps) {

    const remove = (event: MouseEvent, index: number) => {
        event.stopPropagation();
        event.preventDefault();
        props.removeSegment(index)
    }


    const exportSegments = () => {
        exportToJsonFile(props.segments, 'output.json');
    }


    return (
        <>
            {
                props.segments.map((item, index) => (
                    <div key={index} className={props.selectedItemIndex === index ? 'nav-item selected' : 'nav-item'}
                         onClick={() => props.onSelected(index)}>
                        {item.text}

                        <div className="clear" onClick={event => remove(event, index)}>X</div>
                    </div>
                ))
            }
            <br/>
            <AddForm onAdded={props.segmentAdded}/>

            <br/>
            <br/>
            <button onClick={exportSegments}>Export</button>

            <br/>
            <button onClick={props.clearAllData}>Clear</button>
        </>

    )
}

export default SegmentList
