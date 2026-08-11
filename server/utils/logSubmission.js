export function logSubmission(type, submission, req) {
  console.log(JSON.stringify({
    event: type,
    receivedAt: new Date().toISOString(),
    ip: req.ip,
    submission,
  }, null, 2))
}
