package types

type ChatInput struct {
	Body struct {
		Message  string  `json:"message" doc:"User message to send to the chatbot"`
		ThreadID *string `json:"thread_id,omitempty" doc:"Existing thread id to continue the conversation"`
	}
}

type ChatOutput struct {
	Body struct {
		Answer      string  `json:"answer"`
		NewThreadID *string `json:"new_thread_id,omitempty"`
	}
}
