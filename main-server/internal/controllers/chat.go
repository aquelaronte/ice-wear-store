package controllers

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"arias.systems.ice-wear-store/main-server/config"
	"arias.systems.ice-wear-store/main-server/internal/controllers/types"
)

type frostAnswerRequest struct {
	Message   string   `json:"message"`
	ThreadID  *string  `json:"thread_id,omitempty"`
	ImageUrls []string `json:"image_urls,omitempty"`
}

type frostAnswerResponse struct {
	Answer      string  `json:"answer"`
	NewThreadID *string `json:"new_thread_id,omitempty"`
}

func Chat(ctx context.Context, input *types.ChatInput) (*types.ChatOutput, error) {
	payload, err := json.Marshal(frostAnswerRequest{
		Message:   input.Body.Message,
		ThreadID:  input.Body.ThreadID,
		ImageUrls: input.Body.ImageUrls,
	})
	if err != nil {
		return nil, err
	}

	url := fmt.Sprintf("%s/answer", config.Envs.FrostAIURL)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Content-Type", "application/json")

	res, err := http.DefaultClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode >= 400 {
		body, _ := io.ReadAll(res.Body)
		return nil, fmt.Errorf("frost-ai returned %d: %s", res.StatusCode, string(body))
	}

	var parsed frostAnswerResponse
	if err := json.NewDecoder(res.Body).Decode(&parsed); err != nil {
		return nil, err
	}

	out := &types.ChatOutput{}
	out.Body.Answer = parsed.Answer
	out.Body.NewThreadID = parsed.NewThreadID
	return out, nil
}
