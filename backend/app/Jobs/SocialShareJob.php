<?php

namespace App\Jobs;

use App\Models\SocialPost;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class SocialShareJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(public int $socialPostId, public string $message)
    {
    }

    public function handle(): void
    {
        $post = SocialPost::find($this->socialPostId);
        if (! $post) return;

        // TODO: Integrate with actual social APIs per $post->platform
        // Simulate success
        $post->status = 'shared';
        $post->share_id = 'sh'.uniqid();
        $post->save();
    }
}
