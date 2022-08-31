package main

import (
	"sync"
	"time"
)

type CacheRepo struct {
	entries map[string]string
	entryMu sync.RWMutex
}

func NewCacheRepo() *CacheRepo {
	return &CacheRepo{
		entries: map[string]string{},
	}
}

func (c *CacheRepo) Set(id string, value string) {
	c.entryMu.Lock()
	defer c.entryMu.Unlock()

	c.entries[id] = value
	time.AfterFunc(1*time.Hour, func() {
		c.entryMu.Lock()
		defer c.entryMu.Unlock()
		delete(c.entries, id)
	})
}

func (c *CacheRepo) Get(id string) (string, bool) {
	c.entryMu.RLock()
	defer c.entryMu.RUnlock()
	item, ok := c.entries[id]
	return item, ok
}
