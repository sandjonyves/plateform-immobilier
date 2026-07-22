"""Pagination standard pour toutes les listes API."""

from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """
    Pagination par numéro de page.

    Query params :
    - page : numéro de page (1-indexé)
    - page_size : taille de page (max 100)
    """

    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 100
