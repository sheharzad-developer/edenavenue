'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Select from '@/components/ui/Select'
import Button from '@/components/ui/Button'

interface RequestFormProps {
  onSubmit: (data: { title: string; description: string; priority: string }) => Promise<void>
  onCancel?: () => void
}

export default function RequestForm({ onSubmit, onCancel }: RequestFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('MEDIUM')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required')
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({ title: title.trim(), description: description.trim(), priority })
      setTitle('')
      setDescription('')
      setPriority('MEDIUM')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create request')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </div>
      )}

      <Input
        label="Title"
        type="text"
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="e.g., Leaky faucet in kitchen"
        required
      />

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
        placeholder="Please provide details about the maintenance issue..."
        required
      />

      <Select
        label="Priority"
        value={priority}
        onChange={(e) => setPriority(e.target.value)}
      >
        <option value="LOW">Low</option>
        <option value="MEDIUM">Medium</option>
        <option value="HIGH">High</option>
        <option value="URGENT">Urgent</option>
      </Select>

      <div className="flex gap-3">
        <Button type="submit" className="flex-1" isLoading={isSubmitting}>
          Submit Request
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
