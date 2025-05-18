from django.shortcuts import render
from django.views.generic import View


class HomeView(View):
    def get(self, request):
        context = {}

        return render(request, 'core/home_page.html', context)


class BrowseView(View):
    def get(self, request):

        return render(request, 'core/browse.html')