import React from 'react';
import {Spin,Result,message,Button} from 'antd';
import io from "socket.io-client";
import {MouseMap,KeyMap} from "../KeyMaps";


class Session extends React.Component{

    constructor(props) {
        super(props);
        this.state = {
          ready:false,
          result:false,
          resultText:""
        };
    }

    handleMouseMove = (e)=>{
        if (!this.socket) return;
        this.socket.emit('mouse', e.clientX, e.clientY, 0, false);
        e.preventDefault();
        return false;
    }
    handleMouseDown = (e)=>{
        if (!this.socket) return;
        this.socket.emit('mouse', e.clientX, e.clientY , MouseMap[e.button], true);
        e.preventDefault();
        return false;
    }
    handleMouseUp = (e)=>{
        if (!this.socket) return;
        
        this.socket.emit('mouse', e.clientX, e.clientY, MouseMap[e.button], false);
        e.preventDefault();
        return false;
    }
    handleContextMenu = (e)=>{
        if (!this.socket) return;
        
        this.socket.emit('mouse', e.clientX, e.clientY , MouseMap[e.button], false);
        e.preventDefault();
        return false;
    }
    handleMouseWheel = (e)=>{
        if (!this.socket) return;
        
        var isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
        var delta = isHorizontal?e.deltaX:e.deltaY;
        var step = Math.round(Math.abs(delta) / 10);
        
        this.socket.emit('wheel', e.clientX, e.clientY , step, delta > 0, isHorizontal);
        e.preventDefault();
        return false;
    }
    handleKeyDown = (e)=>{
        if (!this.socket) return;
        if(e.key === "v" && e.ctrlKey){
            navigator.clipboard.readText().then((clipboardData)=>{
                if(clipboardData !== window.lastClipboardData){
                    window.lastClipboardData = clipboardData
                    window.preventVkey = true
                    this.socket.emit('paste', clipboardData, ()=>{
                        this.socket.emit('scancode', 0x001D, true);
                        this.socket.emit('scancode', 0x002F, true);
                        this.socket.emit('scancode', 0x002F, false);
                        this.socket.emit('scancode', 0x001D, false);
                    });
                }else{
                    this.socket.emit('scancode', KeyMap[e.code], true);
                }
            },function(){
                message.warning("读取剪切板失败");	
            });
        }else{
            this.socket.emit('scancode', KeyMap[e.code], true);
        }
        e.preventDefault();
        return false;
    }

    handleKeyUp = (e)=>{
        if (!this.socket) return;
        if(window.preventVkey){
            window.preventVkey = false;
        }else{
            this.socket.emit('scancode', KeyMap[e.code], false);
        }
        e.preventDefault();
        return false;
    }

    unbind = ()=>{
        this.canvas.removeEventListener('mousemove',this.handleMouseMove);
        this.canvas.removeEventListener('mousedown',this.handleMouseDown);
        this.canvas.removeEventListener('mouseup',this.handleMouseUp);
        this.canvas.removeEventListener('contextmenu',this.handleContextMenu);
        this.canvas.removeEventListener('mousewheel',this.handleMouseWheel);
        window.removeEventListener("keydown",this.handleKeyDown);
        window.removeEventListener("keyup",this.handleKeyUp);
    }
    bind=()=>{
        this.canvas.addEventListener('mousemove', this.handleMouseMove );
        this.canvas.addEventListener('mousedown',  this.handleMouseDown );
        this.canvas.addEventListener('mouseup',  this.handleMouseUp );
        this.canvas.addEventListener('contextmenu', this.handleContextMenu );
        this.canvas.addEventListener('mousewheel',  this.handleMouseWheel );
        window.addEventListener('keydown', this.handleKeyDown );
        window.addEventListener('keyup', this.handleKeyUp );
    }

    componentWillUnmount(){
        this.socket.emit('closerdp');
        this.unbind();
    }
    time = 0;
    count = 0;
    computedFps() {
        let now = new Date().getTime();
        if (now - this.time >= 1000) {
            this.time = now;
            this.fps.innerHTML = this.count;
            this.count = 0;
        } else {
            this.count++;
        }
    }

    componentDidMount(){
        this.socket = io(window.location.protocol + "//" + window.location.host).on('rdp-connect', ()=>{
            this.bind();
            this.setState({
                ready:true
            })
        }).on('rdp-bitmap', (bitmap)=>{       
            var image = new Image();
			image.src = bitmap.buffer;
			image.onload = ()=>{
                this.ctx.drawImage(image, bitmap.x, bitmap.y);
                this.computedFps();
			}
        }).on('rdp-close', (data)=>{
            this.setState({
                ready:true,
                result:true,
                resultText:data.msg
            })
        }).on('rdp-error',  (data)=>{
            this.setState({
                ready:true,
                result:true,
                resultText:data.msg
            })
        });
        this.sessionId = this.props.match.params.sessionId;
        this.fps = this.refs.fps;
        this.canvas = this.refs.player;
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
        this.socket.emit('start', this.sessionId,this.canvas.width, this.canvas.height );
    }

    render(){
        return (
            <div style={{width:"100%",height:"100%"}}>
                <span ref="fps" style={{position:"absolute",left:20,top:20}}></span>
                {this.state.result?<Result
                    style={{paddingTop:240}}
                    status="warning"
                    title={this.state.resultText}
                />:null}
                {this.state.ready?null:<Spin style={{position:"absolute",left:"50%",top:"50%"}} />}
                {!this.state.result?<canvas ref="player"></canvas>:null}
            </div>
        );
    }
}
  
export default Session;
  