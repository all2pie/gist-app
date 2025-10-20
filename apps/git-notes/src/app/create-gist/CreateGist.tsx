import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGist } from '@/api/endpoints/gist.api';
import { CreateGistData } from '@/api/types/gist-api.types';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-markdown';
import 'prismjs/themes/prism.css';

interface GistFile {
  filename: string;
  content: string;
}

interface CreateGistFormData {
  description: string;
  isPublic: boolean;
  files: GistFile[];
}

// Helper function to detect language from filename
const getLanguageFromFilename = (filename: string): string => {
  const extension = filename.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'js':
    case 'jsx':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'md':
      return 'markdown';
    case 'html':
      return 'markup';
    default:
      return 'javascript'; // Default fallback
  }
};

export const CreateGist: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateGistFormData>({
    defaultValues: {
      description: '',
      isPublic: true,
      files: [{ filename: '', content: '' }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'files',
  });

  const createGistMutation = useMutation({
    mutationFn: async (data: CreateGistData) => {
      return createGist(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gists'] });
      navigate('/');
    },
  });

  const addFile = () => {
    append({ filename: '', content: '' });
  };

  const removeFile = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = (data: CreateGistFormData) => {
    const validFiles = data.files.filter(
      (file) => file.filename.trim() && file.content.trim()
    );

    if (validFiles.length === 0) {
      alert('Please add at least one file with both filename and content.');
      return;
    }

    const gistFiles: Record<string, { content: string }> = {};
    validFiles.forEach((file) => {
      gistFiles[file.filename] = { content: file.content };
    });

    const gistData: CreateGistData = {
      description: data.description || 'No description provided',
      public: data.isPublic,
      files: gistFiles,
    };

    createGistMutation.mutate(gistData);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Create Gist
        </h1>
      </div>

      {/* Description Input */}
      <div className="mb-6">
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              placeholder="This is a Git Description"
              className="w-full text-gray-600"
            />
          )}
        />
      </div>

      {/* Files */}
      <div className="space-y-6">
        {fields.map((field, index) => (
          <div
            key={field.id}
            className="border border-gray-200 rounded-lg overflow-hidden"
          >
            {/* File Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <Controller
                name={`files.${index}.filename`}
                control={control}
                rules={{ required: 'Filename is required' }}
                render={({ field: filenameField }) => (
                  <Input
                    {...filenameField}
                    placeholder="Filename including extension..."
                    className="flex-1 mr-3 bg-white"
                  />
                )}
              />
              {fields.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </Button>
              )}
            </div>

            {/* File Content */}
            <div className="relative">
              <Controller
                name={`files.${index}.content`}
                control={control}
                rules={{ required: 'Content is required' }}
                render={({ field: contentField }) => {
                  const filename = fields[index]?.filename || '';
                  const language = getLanguageFromFilename(filename);

                  return (
                    <div className="border-0">
                      <Editor
                        value={contentField.value}
                        onValueChange={contentField.onChange}
                        highlight={(code) => {
                          try {
                            return highlight(
                              code,
                              languages[language] || languages.javascript,
                              language
                            );
                          } catch {
                            return code; // Fallback to plain text if highlighting fails
                          }
                        }}
                        padding={16}
                        placeholder="Enter your code here..."
                        style={{
                          fontFamily:
                            '"Fira Code", "Fira Mono", Consolas, "Liberation Mono", Courier, monospace',
                          fontSize: 14,
                          lineHeight: 1.5,
                          minHeight: '320px',
                          backgroundColor: '#fafafa',
                          border: 'none',
                          outline: 'none',
                        }}
                      />
                    </div>
                  );
                }}
              />

              {/* Optional: Show validation errors */}
              {errors.files?.[index]?.content && (
                <div className="text-red-500 text-xs mt-1 px-4">
                  {errors.files[index]?.content?.message}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between mt-8">
        <Button
          type="button"
          variant="outline"
          onClick={addFile}
          className="text-gray-600 border-gray-300"
        >
          Add file
        </Button>

        <div className="flex items-center gap-4">
          {/* Public/Private Toggle */}
          <div className="flex items-center gap-2">
            <Controller
              name="isPublic"
              control={control}
              render={({ field }) => (
                <label className="text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="mr-2"
                  />
                  Public gist
                </label>
              )}
            />
          </div>

          <Button
            type="submit"
            disabled={createGistMutation.isPending}
            className="bg-teal-700 hover:bg-teal-800 text-white px-6"
          >
            {createGistMutation.isPending ? 'Creating...' : 'Create Gist'}
          </Button>
        </div>
      </div>
    </form>
  );
};
