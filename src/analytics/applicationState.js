// Shared marker between the application flow and the page that replaces it.
//
// ApplicationFlow unmounts the moment a submission succeeds, so its unmount
// alone cannot distinguish "finished" from "walked away". OpenAccountPage sets
// this flag when the success panel appears.

let submitted = false

export function markApplicationSubmitted() {
  submitted = true
}

export function wasApplicationSubmitted() {
  return submitted
}

export function resetApplicationSubmitted() {
  submitted = false
}
