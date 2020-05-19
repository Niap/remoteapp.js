import React from 'react';
import io from "socket.io-client";
import {MouseMap,KeyMap} from "../KeyMaps";


class Session extends React.Component{

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
                    alert("读取剪切板失败");	
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
        this.socket = io(window.location.protocol + "//" + window.location.host).on('rdp-connect', ()=>{
            this.bind();
        }).on('rdp-bitmap', (bitmap)=>{
            var image = new Image();
			image.src = bitmap.buffer;
			image.onload = ()=>{
				this.ctx.drawImage(image, bitmap.x, bitmap.y);
			}
        }).on('rdp-close', function() {
            
        }).on('rdp-error', function (err) {
            
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
                <canvas ref="player">

                </canvas>
            </div>
        );
    }
}
  
export default Session;
  