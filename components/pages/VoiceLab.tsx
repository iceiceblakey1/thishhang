import React, { useState, useCallback } from 'react';
import { API_BASE_URL } from '../../utils';

const VoiceLab: React.FC = () => {
    const [text, setText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('gemini-2.5-pro-preview-tts');
    const [isLoading, setIsLoading] = useState(false);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(event.target.value);
    };

    const handleVoiceChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedVoice(event.target.value);
    };

    const generateAudio = useCallback(async () => {
        if (!text.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setAudioUrl(null);

        try {
            const response = await fetch(`${API_BASE_URL}/tts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text,
                    modelId: selectedVoice,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to generate audio');
            }

            const { audioUrl: newAudioUrl } = await response.json();
            setAudioUrl(newAudioUrl);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
            console.error("Error generating audio:", err);
        } finally {
            setIsLoading(false);
        }
    }, [text, selectedVoice, isLoading]);

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Voice Lab</h2>
            <p>Experiment with different voices and text-to-speech models.</p>

            <div className="space-y-4">
                <textarea
                    className="w-full p-2 border rounded bg-gray-800 text-white"
                    rows={6}
                    value={text}
                    onChange={handleTextChange}
                    placeholder="Enter text to synthesize..."
                />
                <select
                    className="w-full p-2 border rounded bg-gray-800 text-white"
                    value={selectedVoice}
                    onChange={handleVoiceChange}
                >
                    <option value="gemini-2.5-flash-preview-tts">Gemini 2.5 Flash Preview</option>
                    <option value="gemini-2.5-pro-preview-tts">Gemini 2.5 Pro Preview</option>
                </select>
                <button
                    className="w-full p-2 bg-blue-600 hover:bg-blue-700 rounded disabled:bg-gray-500"
                    onClick={generateAudio}
                    disabled={isLoading || !text.trim()}
                >
                    {isLoading ? 'Generating...' : 'Generate Audio'}
                </button>
            </div>

            {error && (
                <div className="mt-4 p-2 bg-red-500 text-white rounded">
                    {error}
                </div>
            )}

            {audioUrl && (
                <div className="mt-4">
                    <audio controls src={audioUrl} className="w-full" autoPlay>
                        Your browser does not support the audio element.
                    </audio>
                </div>
            )}
        </div>
    );
};

export default VoiceLab;