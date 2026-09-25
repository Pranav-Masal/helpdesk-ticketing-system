from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Ticket, Comment

User = get_user_model()

class TicketFlowTests(APITestCase):
    def setUp(self):
        self.customer = User.objects.create_user(username="customer1", email="customer1@example.com", password="pass1234", role="CUSTOMER")
        self.agent = User.objects.create_user(username="agent1", email="agent1@example.com", password="pass1234", role="AGENT")
        self.client.force_authenticate(user=self.customer)

    def test_customer_can_create_and_view_ticket(self):
        r = self.client.post("/api/tickets/", {"title":"Internet issue","description":"No internet","priority":"HIGH"}, format="json")
        self.assertEqual(r.status_code, 201)
        self.assertIn("id", r.data)
        tid = r.data["id"]
        r = self.client.get(f"/api/tickets/{tid}/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["status"], "OPEN")

    def test_customer_can_comment(self):
        ticket = Ticket.objects.create(title="Printer", description="Not printing", created_by=self.customer)
        r = self.client.get(f"/api/tickets/{ticket.id}/comments/")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data, [])
        r = self.client.post(f"/api/tickets/{ticket.id}/comments/", {"message":"Still waiting"}, format="json")
        self.assertEqual(r.status_code, 201)
        self.assertEqual(Comment.objects.count(), 1)

    def test_agent_can_assign_and_resolve(self):
        ticket = Ticket.objects.create(title="VPN", description="VPN down", created_by=self.customer)
        self.client.force_authenticate(user=self.agent)
        r = self.client.patch(f"/api/tickets/{ticket.id}/assign/", {"agent_id": self.agent.id}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["status"], "ASSIGNED")
        r = self.client.patch(f"/api/tickets/{ticket.id}/status/", {"status":"IN_PROGRESS"}, format="json")
        self.assertEqual(r.status_code, 200)
        r = self.client.post(f"/api/tickets/{ticket.id}/resolve/", {"resolution":"Restarted VPN service"}, format="json")
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.data["status"], "RESOLVED")
