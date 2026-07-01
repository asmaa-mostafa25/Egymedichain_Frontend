import{r as p,l as e,X as u}from"./index-B4PlzXfA.js";const x=({isOpen:a,onClose:t,title:o,children:s,position:n="right",width:l="480px",showClose:d=!0,closeOnOverlay:c=!0,footer:i})=>(p.useEffect(()=>{const r=g=>{g.key==="Escape"&&a&&(t==null||t())};return a&&(document.addEventListener("keydown",r),document.body.style.overflow="hidden"),()=>{document.removeEventListener("keydown",r),document.body.style.overflow=""}},[a,t]),a?e.jsxs("div",{style:{position:"fixed",inset:0,backgroundColor:"rgba(0, 0, 0, 0.6)",backdropFilter:"blur(2px)",zIndex:"var(--z-modal)"},onClick:()=>c&&(t==null?void 0:t()),children:[e.jsxs("div",{style:{position:"absolute",top:0,bottom:0,[n]:0,width:"100%",maxWidth:l,backgroundColor:"var(--bg-card)",borderLeft:n==="right"?"1px solid var(--border-primary)":"none",borderRight:n==="left"?"1px solid var(--border-primary)":"none",boxShadow:"var(--shadow-xl)",display:"flex",flexDirection:"column",animation:`slideIn${n==="right"?"Right":"Left"} 0.2s ease`},onClick:r=>r.stopPropagation(),children:[(o||d)&&e.jsxs("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"var(--spacing-lg)",borderBottom:"1px solid var(--border-primary)"},children:[o&&e.jsx("h2",{style:{fontSize:"var(--font-size-lg)",fontWeight:600,color:"var(--text-primary)",margin:0},children:o}),d&&e.jsx("button",{onClick:t,style:{padding:"var(--spacing-xs)",backgroundColor:"transparent",border:"none",borderRadius:"var(--radius-md)",color:"var(--text-muted)",cursor:"pointer",transition:"all var(--transition-fast)"},onMouseEnter:r=>{r.currentTarget.style.backgroundColor="var(--bg-input)",r.currentTarget.style.color="var(--text-primary)"},onMouseLeave:r=>{r.currentTarget.style.backgroundColor="transparent",r.currentTarget.style.color="var(--text-muted)"},children:e.jsx(u,{size:20})})]}),e.jsx("div",{style:{flex:1,padding:"var(--spacing-lg)",overflowY:"auto"},children:s}),i&&e.jsx("div",{style:{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:"var(--spacing-md)",padding:"var(--spacing-lg)",borderTop:"1px solid var(--border-primary)",backgroundColor:"var(--bg-secondary)"},children:i})]}),e.jsx("style",{children:`
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
        `})]}):null);export{x as D};
//# sourceMappingURL=Drawer-C58pM85g.js.map
