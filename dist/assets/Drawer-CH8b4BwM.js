import{j as u,r as g,l as e,X as y}from"./index-C3pjI6Qf.js";/**
 * @license lucide-react v0.564.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const m=[["path",{d:"M5 12h14",key:"1ays0h"}],["path",{d:"M12 5v14",key:"s699le"}]],v=u("plus",m),f=({isOpen:a,onClose:t,title:o,children:i,position:n="right",width:l="480px",showClose:d=!0,closeOnOverlay:c=!0,footer:s})=>(g.useEffect(()=>{const r=p=>{p.key==="Escape"&&a&&(t==null||t())};return a&&(document.addEventListener("keydown",r),document.body.style.overflow="hidden"),()=>{document.removeEventListener("keydown",r),document.body.style.overflow=""}},[a,t]),a?e.jsxs("div",{style:{position:"fixed",inset:0,backgroundColor:"rgba(0, 0, 0, 0.6)",backdropFilter:"blur(2px)",zIndex:"var(--z-modal)"},onClick:()=>c&&(t==null?void 0:t()),children:[e.jsxs("div",{style:{position:"absolute",top:0,bottom:0,[n]:0,width:"100%",maxWidth:l,backgroundColor:"var(--bg-card)",borderLeft:n==="right"?"1px solid var(--border-primary)":"none",borderRight:n==="left"?"1px solid var(--border-primary)":"none",boxShadow:"var(--shadow-xl)",display:"flex",flexDirection:"column",animation:`slideIn${n==="right"?"Right":"Left"} 0.2s ease`},onClick:r=>r.stopPropagation(),children:[(o||d)&&e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"var(--spacing-lg)",borderBottom:"1px solid var(--border-primary)"},children:[o&&e.jsx("h2",{style:{fontSize:"var(--font-size-lg)",fontWeight:600,color:"var(--text-primary)",margin:0},children:o}),d&&e.jsx("button",{onClick:t,style:{padding:"var(--spacing-xs)",backgroundColor:"transparent",border:"none",borderRadius:"var(--radius-md)",color:"var(--text-muted)",cursor:"pointer",transition:"all var(--transition-fast)"},onMouseEnter:r=>{r.currentTarget.style.backgroundColor="var(--bg-input)",r.currentTarget.style.color="var(--text-primary)"},onMouseLeave:r=>{r.currentTarget.style.backgroundColor="transparent",r.currentTarget.style.color="var(--text-muted)"},children:e.jsx(y,{size:20})})]}),e.jsx("div",{style:{flex:1,padding:"var(--spacing-lg)",overflowY:"auto"},children:i}),s&&e.jsx("div",{style:{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:"var(--spacing-md)",padding:"var(--spacing-lg)",borderTop:"1px solid var(--border-primary)",backgroundColor:"var(--bg-secondary)"},children:s})]}),e.jsx("style",{children:`
          @keyframes slideInRight {
            from {
              transform: translateX(100%);
            }
            to {
              transform: translateX(0);
            }
          }
          @keyframes slideInLeft {
            from {
              transform: translateX(-100%);
            }
            to {
              transform: translateX(0);
            }
          }
        `})]}):null);export{f as D,v as P};
//# sourceMappingURL=Drawer-CH8b4BwM.js.map
