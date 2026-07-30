const Module = require('module');
const originalResolve = Module._resolveFilename;

Module._resolveFilename = function (request, parent, isMain, options) {
  if (
    parent &&
    parent.id &&
    parent.id.includes('node_modules')
  ) {
    if (request === 'typescript') {
      try {
        return originalResolve.call(this, '@typescript/typescript6', parent, isMain, options);
      } catch (err) {
        // Fallback
      }
    } else if (request.startsWith('typescript/')) {
      try {
        const redirected = request.replace('typescript/', '@typescript/typescript6/');
        return originalResolve.call(this, redirected, parent, isMain, options);
      } catch (err) {
        // Fallback
      }
    }
  }
  return originalResolve.call(this, request, parent, isMain, options);
};
