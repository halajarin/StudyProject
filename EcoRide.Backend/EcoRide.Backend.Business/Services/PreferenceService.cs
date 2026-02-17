using EcoRide.Backend.Business.Services.Interfaces;
using Microsoft.Extensions.Configuration;
using MongoDB.Bson;
using MongoDB.Driver;

namespace EcoRide.Backend.Business.Services;

public class PreferenceService : IPreferenceService
{
    private readonly IMongoCollection<BsonDocument> _preferencesCollection;

    public PreferenceService(IMongoDatabase mongoDatabase, IConfiguration configuration)
    {
        var collectionName = configuration["MongoDbSettings:PreferencesCollectionName"];
        _preferencesCollection = mongoDatabase.GetCollection<BsonDocument>(collectionName!);
    }

    public async Task<Dictionary<string, object?>?> GetPreferencesAsync(int userId)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("utilisateur_id", userId);
        var doc = await _preferencesCollection.Find(filter).FirstOrDefaultAsync();
        if (doc == null) return null;

        doc.Remove("_id");
        var dict = new Dictionary<string, object?>();
        foreach (var element in doc)
        {
            dict[element.Name] = BsonTypeMapper.MapToDotNetValue(element.Value);
        }
        return dict;
    }

    public async Task CreateOrUpdatePreferencesAsync(int userId, Dictionary<string, object> preferences)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("utilisateur_id", userId);
        var existing = await _preferencesCollection.Find(filter).FirstOrDefaultAsync();

        var document = new BsonDocument
        {
            { "utilisateur_id", userId },
            { "fumeur", BsonValue.Create(preferences.ContainsKey("fumeur") && (bool)preferences["fumeur"]) },
            { "animaux", BsonValue.Create(preferences.ContainsKey("animaux") && (bool)preferences["animaux"]) }
        };

        // Add custom preferences
        if (preferences.ContainsKey("preferences_personnalisees"))
        {
            var customPrefs = preferences["preferences_personnalisees"] as List<string> ?? new List<string>();
            document.Add("preferences_personnalisees", new BsonArray(customPrefs));
        }

        document.Add("date_modification", DateTime.UtcNow);

        if (existing != null)
        {
            await _preferencesCollection.ReplaceOneAsync(filter, document);
        }
        else
        {
            await _preferencesCollection.InsertOneAsync(document);
        }
    }

    public async Task DeletePreferencesAsync(int userId)
    {
        var filter = Builders<BsonDocument>.Filter.Eq("utilisateur_id", userId);
        await _preferencesCollection.DeleteOneAsync(filter);
    }
}
