using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using EcoRide.Backend.Controllers;

namespace EcoRide.Backend.Tests.Controllers;

// Concrete implementation of BaseController for testing
public class TestController : BaseController
{
    public int TestGetCurrentUserId() => GetCurrentUserId();
    public string TestGetCurrentUserEmail() => GetCurrentUserEmail();
    public string TestGetCurrentUserName() => GetCurrentUserName();
    public bool TestUserHasRole(string role) => UserHasRole(role);
}

public class BaseControllerTests
{
    private TestController CreateControllerWithUser(int userId, string email = "test@example.com", string name = "TestUser", List<string>? roles = null)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Name, name)
        };

        if (roles != null)
        {
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }
        }

        var identity = new ClaimsIdentity(claims, "TestAuth");
        var claimsPrincipal = new ClaimsPrincipal(identity);

        var controller = new TestController
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = claimsPrincipal
                }
            }
        };

        return controller;
    }

    [Fact]
    public void GetCurrentUserId_ValidUser_ReturnsUserId()
    {
        // Arrange
        int expectedUserId = 123;
        var controller = CreateControllerWithUser(expectedUserId);

        // Act
        int actualUserId = controller.TestGetCurrentUserId();

        // Assert
        Assert.Equal(expectedUserId, actualUserId);
    }

    [Fact]
    public void GetCurrentUserId_NoUserIdClaim_ThrowsUnauthorizedException()
    {
        // Arrange
        var controller = new TestController
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity())
                }
            }
        };

        // Act & Assert
        var exception = Assert.Throws<UnauthorizedAccessException>(() => controller.TestGetCurrentUserId());
        Assert.Equal("User ID not found in token", exception.Message);
    }

    [Fact]
    public void GetCurrentUserEmail_ValidUser_ReturnsEmail()
    {
        // Arrange
        string expectedEmail = "user@example.com";
        var controller = CreateControllerWithUser(1, email: expectedEmail);

        // Act
        string actualEmail = controller.TestGetCurrentUserEmail();

        // Assert
        Assert.Equal(expectedEmail, actualEmail);
    }

    [Fact]
    public void GetCurrentUserEmail_NoEmailClaim_ThrowsUnauthorizedException()
    {
        // Arrange
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, "1")
        };
        var identity = new ClaimsIdentity(claims, "TestAuth");
        var controller = new TestController
        {
            ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(identity)
                }
            }
        };

        // Act & Assert
        var exception = Assert.Throws<UnauthorizedAccessException>(() => controller.TestGetCurrentUserEmail());
        Assert.Equal("User email not found in token", exception.Message);
    }

    [Fact]
    public void GetCurrentUserName_ValidUser_ReturnsName()
    {
        // Arrange
        string expectedName = "John Doe";
        var controller = CreateControllerWithUser(1, name: expectedName);

        // Act
        string actualName = controller.TestGetCurrentUserName();

        // Assert
        Assert.Equal(expectedName, actualName);
    }

    [Fact]
    public void UserHasRole_UserHasRole_ReturnsTrue()
    {
        // Arrange
        var roles = new List<string> { "Driver", "Passenger" };
        var controller = CreateControllerWithUser(1, roles: roles);

        // Act
        bool hasRole = controller.TestUserHasRole("Driver");

        // Assert
        Assert.True(hasRole);
    }

    [Fact]
    public void UserHasRole_UserDoesNotHaveRole_ReturnsFalse()
    {
        // Arrange
        var roles = new List<string> { "Passenger" };
        var controller = CreateControllerWithUser(1, roles: roles);

        // Act
        bool hasRole = controller.TestUserHasRole("Administrator");

        // Assert
        Assert.False(hasRole);
    }

    [Fact]
    public void UserHasRole_NoRoles_ReturnsFalse()
    {
        // Arrange
        var controller = CreateControllerWithUser(1);

        // Act
        bool hasRole = controller.TestUserHasRole("Driver");

        // Assert
        Assert.False(hasRole);
    }
}
