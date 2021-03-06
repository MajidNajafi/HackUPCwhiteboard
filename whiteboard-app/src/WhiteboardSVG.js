// Main dependencies
import React from 'react';
import ReactDOM from 'react-dom';

export default class WhiteboardSVG extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentPath: [],
            isDrawing: false,
            top: 0,
            left: 0
        };
        this.handleDrawStart = this.handleDrawStart.bind(this);
        this.handleDrawMove = this.handleDrawMove.bind(this);
        this.handleDrawEnd = this.handleDrawEnd.bind(this);
    }

    componentDidMount() {
        const node = ReactDOM.findDOMNode(this.refs.canvas);
        const rect = node.getBoundingClientRect();
        const { left, top } = rect;
        this.setState({ top, left });
    }

    handleDrawStart(e) {
        e.preventDefault();
        let pageX = e.pageX;
        let pageY = e.pageY;
        if (!pageX) {
            if (e.touches) {
                pageX = e.touches[0].pageX;
                pageY = e.touches[0].pageY;
            }
        }
        const x = pageX - this.state.left;
        const y = pageY - this.state.top;

        if (this.props.tool === 'text') {
            const text = prompt("Please enter your text","");
            this.props.handleAddTextField(WhiteboardSVG.textToSVG(text, x, y, this.props.color,WhiteboardSVG.getSize(this.props.size)), true);
        }
        else {
            this.setState((prevState) => {
                if (!prevState.isDrawing) {
                    return {
                        isDrawing: true,
                        activePath: [{x,y}]
                    }
                }
            });
        }
    };

    handleDrawMove(e) {
        if (this.props.tool === 'pencil' || this.props.tool === 'eraser') {
            let pageX = e.pageX;
            let pageY = e.pageY;
            if (!pageX) {
                if (e.touches) {
                    pageX = e.touches[0].pageX;
                    pageY = e.touches[0].pageY;
                }
            }
            this.setState((prevState) => {
                if (prevState.isDrawing) {
                    const x = pageX - prevState.left;
                    const y = pageY - prevState.top;
                    const activePath = prevState.activePath.concat({x, y});
                    return {activePath};
                }
            });
        }
    };

    handleDrawEnd() {
        if (this.props.tool === 'pencil' || this.props.tool === 'eraser') {
            const path = WhiteboardSVG.parsePoints(this.state.activePath, this.props.color, WhiteboardSVG.getSize(this.props.size));
            this.props.handleAddPath(path, true);
            this.setState((prevState) => {
                if (prevState.isDrawing) {
                    return {
                        isDrawing: false,
                        activePath: []
                    };
                }
            });
        }
    };

    static textToSVG(text, x, y, color, size) {
        return <text x={x} y={y} fill={color} fontSize={size*2}>{text}</text>;
    }

    static parsePoints(points, color, size) {
        let path;
        if (points && points.length > 0) {
            path = `M ${points[0].x} ${points[0].y}`;
            let p1, p2, end;
            for (let i = 1; i < points.length - 2; i += 2) {
                p1 = points[i];
                p2 = points[i + 1];
                end = points[i + 2];
                path += ` C ${p1.x} ${p1.y}, ${p2.x} ${p2.y}, ${end.x} ${end.y}`;
            }

            return (
                <path
                    key={path}
                    stroke={color}
                    strokeWidth={size}
                    d={path}
                    fill="none"
                />
            );
        }
    }

    static getSize(size) {
        if (size === 'extraSmall'){
            return(4);
        }
        if (size === 'small'){
            return(8);
        }
        if (size === 'medium'){
            return(12);
        }
        if (size === 'big'){
            return(16);
        }
        if (size === 'extraBig'){
            return(20);
        }
    }

    render() {
        return (
            <div className="whiteboard">
                <svg
                    ref="canvas"
                    onMouseDown={this.handleDrawStart}
                    onTouchStart={this.handleDrawStart}
                    onMouseUp={this.handleDrawEnd}
                    onTouchEnd={this.handleDrawEnd}
                    onMouseMove={this.handleDrawMove}
                    onTouchMove={this.handleDrawMove}
                    className="canvas"
                >
                    {[this.props.paths]}
                    {this.props.brainstorm && [this.props.svgElements]}
                    {WhiteboardSVG.parsePoints(this.state.activePath, this.props.color, WhiteboardSVG.getSize(this.props.size))}
                    {[this.props.textFields]}
                </svg>
            </div>
        );
    }
}