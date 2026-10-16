"use client";

import { useActionState } from "react";
import { saveBlogPostAction, type AdminFormState } from "@/app/actions/admin/content";
import { Field, TextInput, TextArea, Checkbox } from "@/components/ui/Form";
import { SubmitButton } from "@/components/ui/Button";
import { FormAlert } from "@/components/admin/FormAlert";
import { SingleImage } from "@/components/admin/ImageGallery";

const initialState: AdminFormState = {};

export function BlogPostForm({
  post,
}: {
  post?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    coverImage: string | null;
    authorName: string | null;
    published: boolean;
    seoTitle: string | null;
    seoDescription: string | null;
  };
}) {
  const [state, formAction, pending] = useActionState(saveBlogPostAction, initialState);

  return (
    <form action={formAction} className="space-y-6">
      <FormAlert state={state} />
      {post ? <input type="hidden" name="id" value={post.id} /> : null}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Title" htmlFor="title" required error={state.fieldErrors?.title?.[0]}>
          <TextInput id="title" name="title" required defaultValue={post?.title} />
        </Field>
        <Field
          label="URL slug"
          htmlFor="slug"
          error={state.fieldErrors?.slug?.[0]}
          hint={post ? undefined : "Leave blank to generate from the title."}
        >
          <TextInput id="slug" name="slug" defaultValue={post?.slug} placeholder="auto-generated" />
        </Field>
        <Field label="Author" htmlFor="authorName">
          <TextInput id="authorName" name="authorName" defaultValue={post?.authorName ?? ""} />
        </Field>
        <SingleImage initial={post?.coverImage ?? ""} name="coverImage" label="Cover image" />
      </div>

      <Field label="Excerpt" htmlFor="excerpt" required error={state.fieldErrors?.excerpt?.[0]}>
        <TextArea id="excerpt" name="excerpt" required rows={2} defaultValue={post?.excerpt} />
      </Field>

      <Field
        label="Article content"
        htmlFor="content"
        required
        error={state.fieldErrors?.content?.[0]}
        hint="Plain text with blank lines between paragraphs. Links and lists are rendered safely."
      >
        <TextArea id="content" name="content" required rows={16} defaultValue={post?.content} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="SEO title" htmlFor="seoTitle">
          <TextInput id="seoTitle" name="seoTitle" defaultValue={post?.seoTitle ?? ""} />
        </Field>
        <Field label="SEO description" htmlFor="seoDescription">
          <TextInput id="seoDescription" name="seoDescription" defaultValue={post?.seoDescription ?? ""} />
        </Field>
      </div>

      <Checkbox id="published" name="published" defaultChecked={post?.published ?? false} label="Published (visible on the blog)" />

      <SubmitButton disabled={pending}>{pending ? "Saving…" : post ? "Save changes" : "Create post"}</SubmitButton>
    </form>
  );
}
