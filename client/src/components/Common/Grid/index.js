import React from 'react';
import {colType} from '../../../enums.js';
import './index.css'

function Grid({cols, data, rowHeight, height, selectedID, setSelectedID, onSelect}) {
    const defaultColWidth = 100;
    const defaultRowHeight = 35;
    const defaultImgRowHeight = 60;

    const gridRef = React.useRef(null);

    React.useEffect(() => {
        if (onSelect)
            onSelect(selectedID);
    }, [selectedID]);

    React.useEffect(() => {
        if (!data || data.some(d => d.id == selectedID))
            return;

        setSelectedID(data.length > 0 ? data[0].id : 0);
    }, [data]);

    const resultRowHeight = rowHeight ? rowHeight : 
        cols.some(c => c.type == colType.Image) ? defaultImgRowHeight : defaultRowHeight;
    const imgSize = resultRowHeight - 10; // padding = 5

    return (
        <div className="grid" ref={gridRef} style={{height: height}}>
            <div className="grid-headers">
                {cols.map(col =>
                    <div className="grid-header" style={{width: col.width ?? defaultColWidth}}>{col.name ?? ''}</div>
                )}
            </div>
            <div className="grid-data">
                {data ? data.map(line =>
                    <div key={line.id} className={'grid-row' + (line.id == selectedID ? ' selected' : '')} 
                        onClick={() => setSelectedID(line.id)} style={{height: resultRowHeight}}>
                        {cols.map(col =>
                            <div className={'grid-cell' + (col.align ? ' align-' + col.align : '')} style={{width: col.width ?? defaultColWidth}}>
                                {col.type == colType.Image ? (
                                    col.display(line) ? <img src={col.display(line)} style={{maxHeight: imgSize, maxWidth: imgSize}} /> :
                                    <div className="no-image" style={{height: imgSize, width: imgSize}} />
                                ) : col.type == colType.Icon ? (
                                    <div className={'icon icon-' + col.icon} onClick={() => col.onClick(line.id)} />
                                ) : <div className="cell-value">
                                        {col.list ? 
                                            (col.list.find(list => list.value === col.display(line))?.name ?? '') : 
                                            col.display(line)}
                                    </div>}
                            </div>
                        )}
                    </div>
                ) : Array(5).keys().map(_ =>
                    <div className="grid-row" style={{height: resultRowHeight}}>
                        {cols.map(col =>
                            <div className="grid-cell" style={{width: col.width ?? defaultColWidth}}>
                                {col.type == colType.Image ? (
                                    <div className="img-placeholder" style={{height: imgSize, width: imgSize}} />
                                ) : <div className="text-placeholder" />}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Grid;