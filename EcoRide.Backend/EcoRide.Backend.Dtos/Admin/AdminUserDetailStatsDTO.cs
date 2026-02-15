namespace EcoRide.Backend.Dtos.Admin;

public class AdminUserDetailStatsDTO
{
    public bool IsDriver { get; set; }
    public bool IsPassenger { get; set; }
    public DriverStatsDTO? DriverStats { get; set; }
    public PassengerStatsDTO? PassengerStats { get; set; }
    public RatingStatsDTO DriverRatings { get; set; } = new();
    public RatingStatsDTO PassengerRatings { get; set; } = new();
    public ReviewsGivenStatsDTO ReviewsGiven { get; set; } = new();
}

public class DriverStatsDTO
{
    public int TotalCreated { get; set; }
    public int Pending { get; set; }
    public int InProgress { get; set; }
    public int Completed { get; set; }
    public int Cancelled { get; set; }
}

public class PassengerStatsDTO
{
    public int TotalParticipations { get; set; }
    public int Confirmed { get; set; }
    public int Validated { get; set; }
    public int Cancelled { get; set; }
}

public class RatingStatsDTO
{
    public int Count { get; set; }
    public double AverageRating { get; set; }
}

public class ReviewsGivenStatsDTO
{
    public int Count { get; set; }
    public double AverageNoteGiven { get; set; }
}
