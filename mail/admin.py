from django.contrib import admin

from .models import User,Email

# Register your models here.


class EmailAdmin(admin.ModelAdmin):
    filter_horizontal = ('recipients',)

admin.site.register(User)
admin.site.register(Email, EmailAdmin)
