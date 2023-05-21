import React, { useState } from 'react';
import './segment-add.css'

interface AddFormProps {
    onAdded: (content: string) => void;
}

const AddForm: React.FC<AddFormProps> = ({onAdded}) => {
    const [text, setText] = useState('');

    const handleAddClick = () => {
        if (text.trim() !== '') {
            onAdded(text);
            setText('');
        }
    };

    const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(event.target.value);
    };

    const handleTextareaKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            handleAddClick();
        }
    };

    return (
        <div>
            <textarea className="textarea" value={text} onChange={handleTextareaChange}
                      onKeyDown={handleTextareaKeyDown}/><br/>
            <button style={{width: '100%'}} onClick={handleAddClick}>Add</button>
        </div>
    );
};

export default AddForm;
