from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth import get_user_model


User = get_user_model()


class Command(BaseCommand):
    help = "Create the private company Admin account."

    def add_arguments(self, parser):
        parser.add_argument(
            "--username",
            required=True,
        )

        parser.add_argument(
            "--email",
            required=True,
        )

        parser.add_argument(
            "--password",
            required=True,
        )

        parser.add_argument(
            "--first-name",
            default="",
        )

        parser.add_argument(
            "--last-name",
            default="",
        )

    def handle(self, *args, **options):

        username = options["username"]
        email = options["email"]
        password = options["password"]

        if User.objects.filter(username=username).exists():
            raise CommandError(
                f"User '{username}' already exists."
            )

        if User.objects.filter(email=email).exists():
            raise CommandError(
                f"Email '{email}' is already registered."
            )

        admin = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=options["first_name"],
            last_name=options["last_name"],
            role=User.Role.ADMIN,
            approval_status=User.ApprovalStatus.APPROVED,
            is_active=True,
            is_staff=True,
        )

        self.stdout.write(
            self.style.SUCCESS(
                f"Company Admin '{admin.username}' created successfully."
            )
        )