import React, {useLayoutEffect, useState } from 'react'
import rough from 'roughjs/bundled/rough.esm';
import { HuePicker } from 'react-color';

const generator = rough.generator();

const Canvas = () => {
    const [file, setFile] = useState();
    const [elements, setElements] = useState([]);
    const [selectedElement, setSelectedElement] = useState(null);
    const [tool, setTool] = useState('line');
    const [action, setAction] = useState('none');
    const [color, setColor] = useState('#000000');

    //upload image
    const handleUpload = (e) => {
        console.log(e.target.files);
        setFile(URL.createObjectURL(e.target.files[0]));
    }

    //create element
    const createElement = (id, x1, y1, x2, y2, type) => {
        const roughElement =
        type === 'line'
        ? generator.line(x1, y1, x2, y2, {stroke: color})
        : type === 'rectangle'
        ? generator.rectangle(x1, y1, x2-x1, y2-y1, {stroke: color})
        : type === 'circle'
        ? generator.circle(x1, y1,((x2-x1) + (y2-y1)), {stroke: color})
        : generator.ellipse(x1, y1, x2-x1, y2-y1, {stroke: color})

        return { id, x1, y1, x2, y2, type, roughElement };
    }

    //update element
    const updateElement  = (id, x1, y1, x2, y2, type) => {
        const updatedElement = createElement(id, x1, y1, x2, y2, type);

        const elementsCopy = [...elements];
        elementsCopy[id] = updatedElement;
        setElements(elementsCopy);
    }

    //is within element
    const isWithinElement = (x, y, element) => {
        const { type, x1, y1, x2, y2 } = element;
        if (type === "rectangle") {
          const minX = Math.min(x1, x2);
          const maxX = Math.max(x1, x2);
          const minY = Math.min(y1, y2);
          const maxY = Math.max(y1, y2);
          return { x1: minX, y1: minY, x2: maxX, y2: maxY };
        } else {
          if (x1 < x2 || (x1 === x2 && y1 < y2)) {
            return { x1, y1, x2, y2 };
          } else {
            return { x1: x2, y1: y2, x2: x1, y2: y1 };
          }
        }
    }

    const distance = (a, b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));

    //get element at position
    const getElementAtPosition = (x, y, elements)  => {
        return elements.find(element => isWithinElement(x, y, element));
    }

    //handle Mouse pown / drawing
    const handleMouseDown = (e) => {
        const { clientX, clientY } = e;
        if(tool === 'selection') {
            const element = getElementAtPosition(clientX, clientY, elements);
            if(element) {
                const offsetX = clientX - element.x1;
                const offsetY = clientY - element.y1;
                setSelectedElement(...element, offsetX, offsetY);
                setAction('moving');
            }
        } else {
            const id = elements.length;
            const element = createElement(id, clientX, clientY, clientX, clientY, tool);
            setElements(prevState => [...prevState, element]);

            setAction('drawing');
        }

    }

    //handle mouse up / stop drawing
    const handleMouseUp = (e) => {
        setAction('none');
        setSelectedElement(null);
    }

    //handle mouse move
    const handleMouseMove = (event) => {
        const {clientX, clientY} = event;
        if(action === 'drawing') {
            const index = elements.length - 1;
            const {x1, y1} = elements[index];
            updateElement(index, x1, y1, clientX, clientY, tool);
        } else if (action === 'moving'){
            const { id, x1, x2, y1, y2, type, offsetX, offsetY } = selectedElement;
            const width = x2 - x1;
            const height = y2 - y1;
            const nexX1 = clientX - offsetX;
            const nexY1 = clientY - offsetY;
            updateElement(id, nexX1, nexY1, nexX1 + width, nexY1 + height, type);
        }
    }

    //useLayoutEffect
    useLayoutEffect(() => {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const roughCanvas = rough.canvas(canvas);

        elements.forEach(({roughElement}) => roughCanvas.draw(roughElement));
    }, [elements])
    

  return (
    <div>
        <div>
            <HuePicker
                color={color}
                onChangeComplete={ (color) => {setColor(color.hex)}}
            />
            <input type='file' id='image_input' accept='image/png, image/jpg' onChange={handleUpload}/>
            <input type='radio' id='selection' checked={tool === 'selection'} onChange={() => setTool('selection')} /><label>Selection</label>
            <input type='radio' id='line' checked={tool === 'line'} onChange={() => setTool('line')} /><label>Line</label>
            <input type='radio' id='rectangle' checked={tool === 'rectangle'} onChange={() => setTool('rectangle')} /><label>Rectangle</label>
            <input type='radio' id='circle' checked={tool === 'circle'} onChange={() => setTool('circle')} /><label>Circle</label>
            <input type='radio' id='ellipse' checked={tool === 'ellipse'} onChange={() => setTool('ellipse')} /><label>Ellipse</label>
        </div>
        <canvas 
            id='canvas' 
            width='500px' 
            height='500px' 
            style={{backgroundImage: `url(${file})`,backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }}
            onMouseDown = {handleMouseDown}
            onMouseMove = {handleMouseMove}
            onMouseUp = {handleMouseUp}
        >
        </canvas>
    </div>
  )
}

export default Canvas