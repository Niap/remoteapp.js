import React from 'react';
import {Spin,Result,message} from 'antd';
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

    bind=()=>{
        // bind mouse move event
        this.canvas.addEventListener('mousemove',  (e)=>{
            if (!this.socket) return;
            this.socket.emit('mouse', e.clientX, e.clientY, 0, false);
            e.preventDefault();
            return false;
        });
        this.canvas.addEventListener('mousedown',  (e)=>{
            if (!this.socket) return;
            this.socket.emit('mouse', e.clientX, e.clientY , MouseMap[e.button], true);
            e.preventDefault();
            return false;
        });
        this.canvas.addEventListener('mouseup',  (e)=>{
            if (!this.socket) return;
            
            this.socket.emit('mouse', e.clientX, e.clientY, MouseMap[e.button], false);
            e.preventDefault();
            return false;
        });
        this.canvas.addEventListener('contextmenu', (e)=>{
            if (!this.socket) return;
            
            this.socket.emit('mouse', e.clientX, e.clientY , MouseMap[e.button], false);
            e.preventDefault();
            return false;
        });
        
        this.canvas.addEventListener('mousewheel',  (e)=>{
            if (!this.socket) return;
            
            var isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
            var delta = isHorizontal?e.deltaX:e.deltaY;
            var step = Math.round(Math.abs(delta) / 10);
            
            this.socket.emit('wheel', e.clientX, e.clientY , step, delta > 0, isHorizontal);
            e.preventDefault();
            return false;
        });
        
        // bind keyboard event
        window.addEventListener('keydown',  (e)=>{
            if (!this.socket) return;
            if(e.key === "v" && e.ctrlKey){
                navigator.clipboard.readText().then(function(clipboardData){
                    if(clipboardData !== window.lastClipboardData){
                        window.lastClipboardData = clipboardData
                        window.preventVkey = true
                        this.socket.emit('paste', clipboardData, function(){
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
        });
        window.addEventListener('keyup',  (e)=>{
            if (!this.socket) return;
            if(window.preventVkey){
                window.preventVkey = false;
            }else{
                this.socket.emit('scancode', KeyMap[e.code], false);
            }
            e.preventDefault();
            return false;
        });
    }

    componentDidMount(){
        this.socket = io("http://localhost:9250/").on('rdp-connect', ()=>{
            this.bind();
        }).on('rdp-bitmap', (bitmap)=>{
            var image = new Image();
			image.src = bitmap.buffer;
			image.onload = ()=>{
				this.ctx.drawImage(image, bitmap.x, bitmap.y);
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
        this.canvas = this.refs.player;
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
        this.socket.emit('start', this.sessionId,this.canvas.width, this.canvas.height );
    }

    render(){
        return (
            <div>
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
  