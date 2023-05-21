import React, { useState } from 'react';
import './Entities-list.css';

type EntitiesListProps = {
    initialEntities: string[];
    colors: string[];
    onClick: (entity: string) => void;
};

function EntitiesList({ initialEntities, colors, onClick }: EntitiesListProps) {
    const [entities, setEntities] = useState<string[]>(initialEntities);
    const [isAddingEntity, setIsAddingEntity] = useState<boolean>(false);
    const [newEntityName, setNewEntityName] = useState<string>('');

    function handleCreateEntity() {
        setIsAddingEntity(true);
    }

    function handleSaveEntity() {
        if (newEntityName) {
            setEntities([...entities, newEntityName]);
            setIsAddingEntity(false);
            setNewEntityName('');
        }
    }

    function handleCancelAddEntity() {
        setIsAddingEntity(false);
        setNewEntityName('');
    }

    function handleEntityClick(entity: string) {
        onClick(entity);
    }

    function handleNewEntityNameChange(event: React.ChangeEvent<HTMLInputElement>) {
        setNewEntityName(event.target.value);
    }

    return (
        <div className="entities-list">
            <div className="entities-list__buttons">
                {entities.map((entity, index) => (
                    <button key={index} className="entities-list__button" style={{backgroundColor: colors[index]}} onClick={() => handleEntityClick(entity)}>
                        {entity}
                    </button>
                ))}
            </div>
            {isAddingEntity ? (
                <div className="entities-list__add-form">
                    <input type="text" value={newEntityName} onChange={handleNewEntityNameChange} className="entities-list__add-input" />
                    <button onClick={handleSaveEntity} className="entities-list__add-button">Save</button>
                    <button onClick={handleCancelAddEntity} className="entities-list__add-button">Cancel</button>
                </div>
            ) : (
                <button className="entities-list__add-button" onClick={handleCreateEntity}>Add New</button>
            )}
        </div>
    );
}

export default EntitiesList;
