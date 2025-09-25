from django.conf import settings
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email: str, password: str | None, **extra_fields):
        if not email:
            raise ValueError('Users must provide an email address')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_user(self, email: str, password: str | None = None, **extra_fields):
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email: str, password: str, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', User.Role.ADMIN)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    class Role(models.TextChoices):
        BASIC = 'basic', 'Basic'
        PREMIUM = 'premium', 'Premium'
        ADMIN = 'admin', 'Admin'

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    username = None
    email = models.EmailField(unique=True)
    role = models.CharField(max_length=20, choices=Role.choices, default=Role.BASIC)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    premium_until = models.DateTimeField(null=True, blank=True)
    organization = models.CharField(max_length=255, blank=True)
    purpose = models.TextField(blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS: list[str] = []

    objects = UserManager()

    def approve(self):
        self.status = self.Status.APPROVED
        self.save(update_fields=['status'])


class Registration(models.Model):
    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        APPROVED = 'approved', 'Approved'
        REJECTED = 'rejected', 'Rejected'

    email = models.EmailField()
    name = models.CharField(max_length=120)
    organization = models.CharField(max_length=255, blank=True)
    purpose = models.TextField(blank=True)
    memo = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING)
    submitted_at = models.DateTimeField(default=timezone.now)
    decided_at = models.DateTimeField(null=True, blank=True)
    decided_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='processed_registrations',
    )

    class Meta:
        ordering = ['-submitted_at']
        verbose_name = 'Registration'
        verbose_name_plural = 'Registrations'

    def approve(self, reviewer: 'User'):
        self.status = self.Status.APPROVED
        self.decided_at = timezone.now()
        self.decided_by = reviewer
        self.save(update_fields=['status', 'decided_at', 'decided_by'])

    def reject(self, reviewer: 'User'):
        self.status = self.Status.REJECTED
        self.decided_at = timezone.now()
        self.decided_by = reviewer
        self.save(update_fields=['status', 'decided_at', 'decided_by'])
