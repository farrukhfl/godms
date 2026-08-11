export function notFoundHandler(req, res) {
  res.status(404).json({ success: false, message: 'API endpoint not found.', errors: {} })
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error)

  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({ success: false, message: 'Request body must contain valid JSON.', errors: {} })
  }

  console.error('Unhandled API error:', error)
  return res.status(500).json({ success: false, message: 'Unable to process the request right now.', errors: {} })
}
