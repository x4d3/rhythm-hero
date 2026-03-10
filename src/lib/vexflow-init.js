// Pre-define Vex on globalThis so vexflow-debug.js can assign to it
// (vexflow-debug.js uses implicit global assignment which fails in strict mode)
if (typeof globalThis.Vex === 'undefined') {
  globalThis.Vex = function() {};
}
