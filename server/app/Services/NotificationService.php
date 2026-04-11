<?php

namespace App\Services;

use App\Models\UserNotification;

class NotificationService
{
    public function notifyUser(
        int $userId,
        string $type,
        string $message,
        ?string $relatedType = null,
        ?int $relatedId = null,
        ?int $actorId = null
    ): ?UserNotification {
        if ($userId <= 0) {
            return null;
        }

        return UserNotification::create([
            'user_id' => $userId,
            'type' => $type,
            'message' => $message,
            'related_type' => $relatedType,
            'related_id' => $relatedId,
            'actor_id' => $actorId,
            'is_read' => 0,
        ]);
    }

    public function notifyMany(
        array $userIds,
        string $type,
        string $message,
        ?string $relatedType = null,
        ?int $relatedId = null,
        ?int $actorId = null
    ): array {
        $notifications = [];

        foreach (array_values(array_unique(array_filter($userIds))) as $userId) {
            $notifications[] = $this->notifyUser(
                (int) $userId,
                $type,
                $message,
                $relatedType,
                $relatedId,
                $actorId
            );
        }

        return $notifications;
    }
}